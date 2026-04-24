import sqlite3
import csv
import os
import random
import asyncio
from pydantic import BaseModel
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

LOG_FILE = "real_windows_logs.csv"
DB_FILE = "logs.db"

class LogAnalysisRequest(BaseModel):
    message: str
    severity: str = "Unknown"
    event_type: str = "Unknown"

def setup_database():
    """Drops existing tables and populates SQLite FTS5 database directly from Windows CSV logs"""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    c.execute("DROP TABLE IF EXISTS logs")
    
    c.execute('''
        CREATE VIRTUAL TABLE logs USING fts5(
            timestamp UNINDEXED,
            severity,
            source_ip,
            event_type,
            message
        )
    ''')
    
    if not os.path.exists(LOG_FILE):
        conn.commit()
        conn.close()
        return

    log_entries = []
    
    # utf-8-sig automatically wipes any invisible Byte-Order Marks from Windows CSVs
    with open(LOG_FILE, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            timestamp = row.get("TimeCreated", "Unknown Time")
            severity = row.get("LevelDisplayName", "INFO")
            event_type = row.get("ProviderName", "Unknown Provider")
            message = row.get("Message", "")
            
            log_entries.append({
                "timestamp": timestamp,
                "severity": severity,
                "source_ip": "LOCAL_SYSTEM",
                "event_type": event_type,
                "message": message.strip() if message else ""
            })
            
    if log_entries:
        c.executemany('''
            INSERT INTO logs(timestamp, severity, source_ip, event_type, message)
            VALUES (:timestamp, :severity, :source_ip, :event_type, :message)
        ''', log_entries)
        
    conn.commit()
    conn.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_database()
    yield

app = FastAPI(title="Real Windows CSV SOC Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/logs")
def get_logs(
    search: str = Query(None, description="Global full-text search string"),
    limit: int = Query(100, description="Max resulting array payload density per request")
):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    try:
        if search:
            clean_search = search.replace('"', '').strip()
            if not clean_search:
                c.execute("SELECT rowid as id, timestamp, severity, source_ip, event_type, message FROM logs ORDER BY rowid ASC LIMIT ?", (limit,))
            else:
                fts_query = f'"{clean_search}"*'
                c.execute(
                    "SELECT rowid as id, timestamp, severity, source_ip, event_type, message FROM logs WHERE logs MATCH ? ORDER BY rowid ASC LIMIT ?",
                    (fts_query, limit)
                )
        else:
            c.execute("SELECT rowid as id, timestamp, severity, source_ip, event_type, message FROM logs ORDER BY rowid ASC LIMIT ?", (limit,))
            
        rows = c.fetchall()
        logs_list = [dict(row) for row in rows]
            
        return {"logs": logs_list}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.post("/api/analyze")
async def analyze_log(request: LogAnalysisRequest):
    """
    Mock AI Endpoint: High-performance heuristic 'Expert System' simulating a local offline LLM analysis matrix.
    """
    # Emulate complex local token generation payload limits
    await asyncio.sleep(random.uniform(1.2, 2.5))
    
    msg_lower = request.message.lower()
    event_lower = request.event_type.lower()
    
    if "4444" in msg_lower or "metasploit" in msg_lower:
         threat_level = "Critical"
         analysis = "Critical: Reverse Shell/C2 Activity. Action: Immediately sever external network connections for impacted host and audit active processes."
    elif "failed login" in msg_lower or "ssh" in msg_lower or "4625" in msg_lower:
         threat_level = "High"
         analysis = "High: Brute Force Attempt. Action: Block Source IP immediately and enforce targeted MFA audits."
    elif "nmap" in msg_lower or "scanning" in msg_lower:
         threat_level = "Medium"
         analysis = "Medium: Reconnaissance Detected. Action: Monitor perimeter firewalls for aggressive port access anomalies and rate-limit source."
    else:
         threat_level = "Low"
         analysis = "Low: No overt compromise signatures detected. Action: Standard heuristics monitoring maintained successfully."

    return {
        "threat_level": threat_level,
        "analysis": analysis,
        "ai_model": "AEGIS-Llama3-8B-Quantized"
    }
