FROM python:3.11-slim

# Root container scope
WORKDIR /app

# Ensure SQLite CLI is available inside the container natively for DB verification testing by analysts
RUN apt-get update && apt-get install -y sqlite3 && rm -rf /var/lib/apt/lists/*

# Ensure cache integrity by explicitly porting pip requirements separately
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Migrate source backend dependencies (Including the SQLite build sequences and real offline windows logs)
COPY backend/ .

EXPOSE 8000

# Execute FastAPI boot sequences locked cleanly to localhost internal routes
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
