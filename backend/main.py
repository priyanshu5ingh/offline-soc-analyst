import sqlite3
import csv
import os
import random
import time
import asyncio
import logging
from pydantic import BaseModel
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ─── Configuration ─────────────────────────────────────────────────────────────
STATIC_LOG_FILE  = "real_windows_logs.csv"       # Static Windows CSV ingested at boot
LIVE_STREAM_FILE = "/app/shared_logs/live_stream.csv"  # Hot-reload path mounted via Docker volume
DB_FILE          = "logs.db"
POLL_INTERVAL    = 5   # seconds between live-stream polling cycles

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
log = logging.getLogger("aegis")

# ─── Pydantic Models ────────────────────────────────────────────────────────────
class LogAnalysisRequest(BaseModel):
    message:    str
    severity:   str = "Unknown"
    event_type: str = "Unknown"

# ─── Database Helpers ───────────────────────────────────────────────────────────
def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def setup_database():
    """
    Called once at startup.
    Drops the existing FTS5 table, recreates it fresh, and bulk-ingests
    the static real_windows_logs.csv file.
    """
    conn = get_conn()
    c = conn.cursor()

    c.execute("DROP TABLE IF EXISTS logs")
    c.execute("""
        CREATE VIRTUAL TABLE logs USING fts5(
            timestamp UNINDEXED,
            severity,
            source_ip,
            event_type,
            message
        )
    """)

    if not os.path.exists(STATIC_LOG_FILE):
        log.warning(f"Static log file not found: {STATIC_LOG_FILE} — skipping static ingestion.")
        conn.commit()
        conn.close()
        return

    entries = []
    with open(STATIC_LOG_FILE, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            entries.append({
                "timestamp":  row.get("TimeCreated", "Unknown"),
                "severity":   row.get("LevelDisplayName", "Information"),
                "source_ip":  "LOCAL_SYSTEM",
                "event_type": row.get("ProviderName", "Unknown Provider"),
                "message":    (row.get("Message") or "").strip()
            })

    if entries:
        c.executemany("""
            INSERT INTO logs(timestamp, severity, source_ip, event_type, message)
            VALUES (:timestamp, :severity, :source_ip, :event_type, :message)
        """, entries)
        log.info(f"Static ingestion complete: {len(entries)} rows indexed from {STATIC_LOG_FILE}")

    conn.commit()
    conn.close()

# ─── Live Stream Sync Logic ─────────────────────────────────────────────────────
_last_live_row_count = 0   # Track how many rows we saw last cycle to detect changes

def sync_live_stream():
    """
    Reads the LIVE_STREAM_FILE, finds new rows since last check,
    and inserts them into the FTS5 database.
    Returns a dict with execution metrics.
    """
    global _last_live_row_count
    t0 = time.time()
    try:
        if not os.path.exists(LIVE_STREAM_FILE):
            return {
                "status": "error", "rows_inserted": 0, "message": "Live stream file not present yet.",
                "execution_time_ms": round((time.time()-t0)*1000, 2)
            }

        with open(LIVE_STREAM_FILE, mode="r", encoding="utf-8-sig", errors="replace") as f:
            reader = csv.DictReader(f)
            all_rows = list(reader)

        fresh_rows = all_rows[_last_live_row_count:]
        if not fresh_rows:
            return {
                "status": "success", "rows_inserted": 0, "message": "No new events found.",
                "execution_time_ms": round((time.time()-t0)*1000, 2)
            }

        new_entries = []
        for row in fresh_rows:
            new_entries.append({
                "timestamp":  row.get("TimeCreated", "Unknown"),
                "severity":   row.get("LevelDisplayName", "Information"),
                "source_ip":  "LIVE_STREAM",
                "event_type": row.get("ProviderName", "UnifiedLog"),
                "message":    (row.get("Message") or "").strip()
            })

        conn = get_conn()
        c = conn.cursor()
        c.executemany("""
            INSERT INTO logs(timestamp, severity, source_ip, event_type, message)
            VALUES (:timestamp, :severity, :source_ip, :event_type, :message)
        """, new_entries)
        conn.commit()
        conn.close()

        _last_live_row_count = len(all_rows)
        return {
            "status": "success", "rows_inserted": len(new_entries), "message": "Volume mount read successful.",
            "execution_time_ms": round((time.time()-t0)*1000, 2)
        }
    except PermissionError:
        return {"status": "error", "rows_inserted": 0, "message": "File is locked.", "execution_time_ms": round((time.time()-t0)*1000, 2)}
    except Exception as e:
        return {"status": "error", "rows_inserted": 0, "message": str(e), "execution_time_ms": round((time.time()-t0)*1000, 2)}

# ─── Background Worker ──────────────────────────────────────────────────────────
async def live_stream_poller():
    """ Runs forever in the background, polling the live stream every POLL_INTERVAL seconds. """
    global _last_live_row_count
    while True:
        await asyncio.sleep(POLL_INTERVAL)
        res = sync_live_stream()
        if res["status"] == "success" and res["rows_inserted"] > 0:
            log.info(f"Background Sync: ingested {res['rows_inserted']} new event(s). Total seen: {_last_live_row_count}")
        elif res["status"] == "error" and "not present" not in res["message"]:
            log.warning(f"Background Sync error (non-fatal): {res['message']}")


# ─── FastAPI Lifespan ────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: rebuild DB then kick off background poller
    setup_database()
    asyncio.create_task(live_stream_poller())
    log.info("AEGIS SOC Backend online. Live stream poller active.")
    yield
    # Shutdown — nothing explicit needed; task is cancelled by the event loop

app = FastAPI(title="AEGIS SOC Analyst Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── GET /api/logs ────────────────────────────────────────────────────────────────
@app.get("/api/logs")
def get_logs(
    search: str  = Query(None, description="FTS5 full-text search string"),
    limit:  int  = Query(200,  description="Max rows returned")
):
    conn = get_conn()
    c = conn.cursor()

    try:
        # Total indexed count for telemetry panel
        c.execute("SELECT count(*) FROM logs")
        total_indexed = c.fetchone()[0]

        if search:
            clean = search.replace('"', '').strip()
            if not clean:
                c.execute(
                    "SELECT rowid as id, timestamp, severity, source_ip, event_type, message FROM logs ORDER BY rowid DESC LIMIT ?",
                    (limit,)
                )
            else:
                # Support field-scoped FTS5 queries passed directly from the frontend
                # e.g. "severity : \"Error\"*"  or plain keyword
                fts_query = clean if ":" in clean else f'"{clean}"*'
                c.execute(
                    "SELECT rowid as id, timestamp, severity, source_ip, event_type, message FROM logs WHERE logs MATCH ? ORDER BY rowid DESC LIMIT ?",
                    (fts_query, limit)
                )
        else:
            c.execute(
                "SELECT rowid as id, timestamp, severity, source_ip, event_type, message FROM logs ORDER BY rowid DESC LIMIT ?",
                (limit,)
            )

        rows = c.fetchall()
        logs_list = [dict(row) for row in rows]

        return {
            "metadata": {
                "total_indexed_events": total_indexed,
                "returned":            len(logs_list),
                "live_stream_active":  os.path.exists(LIVE_STREAM_FILE)
            },
            "logs": logs_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# ─── POST /api/sync ───────────────────────────────────────────────────────────────
@app.post("/api/sync")
async def force_sync():
    """
    Force an immediate live stream sync, returning strict telemetry data
    for the frontend interactive console.
    """
    res = sync_live_stream()
    if res["status"] == "error":
        raise HTTPException(status_code=500, detail=res["message"])
    return res

# ─── POST /api/analyze ────────────────────────────────────────────────────────────
@app.post("/api/analyze")
async def analyze_log(request: LogAnalysisRequest):
    """
    Mock offline LLM — Heuristic Expert System.
    Simulates local Llama-3 inference latency before returning a structured IR report.
    """
    await asyncio.sleep(random.uniform(1.2, 2.5))

    msg_lower   = request.message.lower()
    event_lower = request.event_type.lower()

    if "4444" in msg_lower or "metasploit" in msg_lower:
        threat_level = "Critical"
        analysis = "Critical: Reverse Shell / C2 Beaconing Activity detected. Action: Immediately sever external network connections for impacted host, dump memory forensics, and initiate full endpoint isolation protocol."
    elif "failed login" in msg_lower or "ssh" in msg_lower or "4625" in msg_lower:
        threat_level = "High"
        analysis = "High: Credential Brute Force / Password Spray Attempt. Action: Block source IP at perimeter firewall, force reset targeted credentials, and enforce MFA across all identity boundaries."
    elif "nmap" in msg_lower or "scanning" in msg_lower or "port scan" in msg_lower:
        threat_level = "Medium"
        analysis = "Medium: Active Network Reconnaissance Detected. Action: Rate-limit and geo-fence the scanning source, review perimeter firewall ACLs, and flag for SOC analyst review."
    elif "malware" in msg_lower or "ransomware" in msg_lower or "defender" in event_lower or "blocked" in msg_lower:
        threat_level = "High"
        analysis = "High: Polymorphic Malware Execution Intercepted. Action: Forensically isolate the host node from Active Directory, rotate Kerberos tokens, and submit sample for sandbox detonation."
    elif "error" in msg_lower or "failed" in msg_lower or "failure" in msg_lower:
        threat_level = "Medium"
        analysis = "Medium: Recurring failure event pattern detected. Action: Investigate root cause — may indicate misconfiguration, resource exhaustion, or early-stage intrusion attempt."
    else:
        threat_level = "Low"
        analysis = "Low: No overt compromise signatures detected in this telemetry entry. Action: Standard baseline monitoring maintained. Continue passive observation."

    return {
        "threat_level": threat_level,
        "analysis":     analysis,
        "ai_model":     "AEGIS-Llama3-8B-Quantized"
    }
