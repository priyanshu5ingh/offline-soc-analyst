#!/bin/bash
# ============================================================
# AEGIS macOS Telemetry Stream Injector
# Pulls macOS Unified Logs every 10 seconds and formats them
# into the exact CSV contract expected by the AEGIS backend.
# ============================================================

SHARED_DIR="./shared_logs"
OUTPUT_FILE="$SHARED_DIR/live_stream.csv"

mkdir -p "$SHARED_DIR"

echo "🛡️  AEGIS macOS Telemetry Stream Starting..."
echo "📂  Output → $OUTPUT_FILE"
echo "🔄  Polling interval: 10 seconds"
echo "--------------------------------------------"

while true; do
    # Write CSV headers first
    echo '"TimeCreated","LevelDisplayName","ProviderName","Message"' > "$OUTPUT_FILE"

    # Pull the last 1 minute of macOS Unified Logs and format as CSV
    log show --style syslog --last 1m 2>/dev/null | tail -n 50 | awk '
    NF > 0 {
        time = $1 " " $2;
        msg  = $0;
        gsub(/"/, "'"'"'", msg);   # Escape double-quotes with single-quotes
        gsub(/\r/, "", msg);       # Strip carriage returns
        printf "\"%s\",\"Information\",\"macOS-UnifiedLog\",\"%s\"\n", time, msg
    }' >> "$OUTPUT_FILE"

    echo "✅  [$(date '+%H:%M:%S')] Logs injected into AEGIS Appliance."
    sleep 10
done
