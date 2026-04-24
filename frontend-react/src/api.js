// ── API Configuration ────────────────────────────────────────────────────
const API_BASE = '/api';

export const API = {
  logs:       `${API_BASE}/logs`,
  analyze:    `${API_BASE}/analyze`,
  sync:       `${API_BASE}/sync`,
  capture:    `${API_BASE}/capture_fresh`,
  executive:  `${API_BASE}/executive_summary`,
};

// ── Fetch Logs ──────────────────────────────────────────────────────────
export async function fetchLogs(query = '', severity = '') {
  const params = new URLSearchParams();
  if (query)    params.set('q', query);
  if (severity) params.set('severity', severity);
  params.set('limit', '200');

  const res = await fetch(`${API.logs}?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Force Sync ──────────────────────────────────────────────────────────
export async function forceSync() {
  const res = await fetch(API.sync, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Fresh Capture ───────────────────────────────────────────────────────
export async function freshCapture() {
  const res = await fetch(API.capture, { method: 'POST' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Analyze Log ─────────────────────────────────────────────────────────
export async function analyzeLog(log) {
  const res = await fetch(API.analyze, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message:    log.message    || '',
      event_type: log.event_type || '',
      severity:   log.severity   || '',
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Executive Summary ───────────────────────────────────────────────────
export async function getExecutiveSummary() {
  const res = await fetch(API.executive);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
