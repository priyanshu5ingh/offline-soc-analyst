import sqlite3
import re
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

LOG_FILE = "sample.log"
DB_FILE = "logs.db"

# Sample Log Format: 2026-04-24T11:35:00Z CRITICAL 192.168.1.50 Failed Login: Multiple failed SSH login attempts for user 'root'
# We use a regex to parse these fields gracefully.
LOG_REGEX = re.compile(
    r"^(?P<timestamp>\S+)\s+(?P<severity>\w+)\s+(?P<source_ip>\S+)\s+(?P<event_type>[^:]+):\s+(?P<message>.*)$"
)

def init_db():
    """Create the FTS5 virtual table for lightning-fast search capabilities."""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    # Using FTS5 (Full-Text Search extension in SQLite)
    c.execute('''
        CREATE VIRTUAL TABLE IF NOT EXISTS logs USING fts5(
            timestamp UNINDEXED,
            severity,
            source_ip,
            event_type,
            message
        )
    ''')
    conn.commit()
    conn.close()

def ingest_logs():
    """Read logs from sample.log, parse them, and insert them into the DB."""
    if not os.path.exists(LOG_FILE):
        return
        
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    # Check if we already have data to avoid duplicate ingestion on every startup
    c.execute("SELECT count(*) FROM logs")
    if c.fetchone()[0] > 0:
        conn.close()
        return

    with open(LOG_FILE, "r", encoding="utf-8") as f:
        for line in f:
            match = LOG_REGEX.match(line.strip())
            if match:
                data = match.groupdict()
                c.execute('''
                    INSERT INTO logs(timestamp, severity, source_ip, event_type, message)
                    VALUES (:timestamp, :severity, :source_ip, :event_type, :message)
                ''', data)
                
    conn.commit()
    conn.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Execute on Startup
    init_db()
    ingest_logs()
    yield
    # Execute on Shutdown
    pass

app = FastAPI(title="Portable Offline SOC Backend", lifespan=lifespan)

# Allow Cross-Origin requests for local frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/logs")
def get_logs(query: str = Query(None, description="Global full-text search string")):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # Returns rows as dictionary-like objects
    c = conn.cursor()
    
    try:
        if query:
            # We sanitize the query to prevent syntax errors in FTS match expression
            clean_query = query.replace('"', '').strip()
            if not clean_query:
                # If query was entirely quotes or empty
                c.execute("SELECT rowid as id, timestamp, severity, source_ip, event_type, message FROM logs ORDER BY rowid ASC")
            else:
                # Wrapping phrase in quotes ensures IP addresses or multiple words match properly
                fts_query = f'"{clean_query}"*' 
                c.execute(
                    "SELECT rowid as id, timestamp, severity, source_ip, event_type, message FROM logs WHERE logs MATCH ? ORDER BY rowid ASC",
                    (fts_query,)
                )
        else:
            c.execute("SELECT rowid as id, timestamp, severity, source_ip, event_type, message FROM logs ORDER BY rowid ASC")
            
        rows = c.fetchall()
        
        # Turn the sqlite3.Row objects into dicts and stringify the 'id'
        logs_list = []
        for row in rows:
            entry = dict(row)
            entry["id"] = str(entry["id"])
            logs_list.append(entry)
            
        return {"logs": logs_list}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
