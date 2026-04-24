FROM python:3.11-slim

WORKDIR /app

# SQLite CLI for in-container verification + curl for health checks
RUN apt-get update && apt-get install -y sqlite3 && rm -rf /var/lib/apt/lists/*

# Install Python deps first (cached layer — only rebuilds when requirements change)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source and static data
COPY backend/ .

# Create the shared_logs volume mount point so Docker doesn't error if
# the host hasn't created the directory yet before running the container
RUN mkdir -p /app/shared_logs

EXPOSE 8000

# Run with a single worker — SQLite is single-writer; multiple workers would conflict
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
