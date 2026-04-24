const { useDeferredValue, useEffect, useState, useCallback, startTransition } = React;

const API_BASE = "http://127.0.0.1:8000";
const API_LOGS_URL = `${API_BASE}/api/logs`;
const API_ANALYZE_URL = `${API_BASE}/api/analyze`;

const panelClass =
    "relative z-10 w-full max-w-full overflow-hidden rounded-[28px] border border-surface-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-all duration-300";

// ─── Severity Helpers ─────────────────────────────────────────────────────────
function getSeverityClasses(severity) {
    const level = String(severity ?? "INFO").toUpperCase();
    if (level === "CRITICAL" || level === "ERROR") {
        return "border border-rose-200 bg-rose-50 text-rose-700 shadow-[0_10px_24px_rgba(190,24,93,0.08)]";
    }
    if (level === "WARNING" || level === "WARN") {
        return "border border-amber-200 bg-amber-50 text-amber-700 shadow-[0_10px_24px_rgba(217,119,6,0.08)]";
    }
    return "border border-teal-200 bg-teal-50 text-teal-700 shadow-[0_10px_24px_rgba(15,118,110,0.08)]";
}

function getThreatLevelClasses(level) {
    const l = String(level ?? "").toLowerCase();
    if (l === "critical") return "text-rose-700 font-extrabold";
    if (l === "high") return "text-orange-600 font-bold";
    if (l === "medium") return "text-amber-600 font-bold";
    return "text-teal-700 font-bold";
}

// ─── System Status Pill ───────────────────────────────────────────────────────
function getSystemState({ error, loading }) {
    if (error) {
        return {
            label: "Feed Offline",
            pillClass: "border border-rose-200 bg-rose-50 text-rose-700 shadow-[0_12px_30px_rgba(190,24,93,0.10)]",
            dotClass: "bg-rose-500",
            pulse: false
        };
    }
    if (loading) {
        return {
            label: "Checking Feed",
            pillClass: "border border-amber-200 bg-amber-50 text-amber-700 shadow-[0_12px_30px_rgba(217,119,6,0.10)]",
            dotClass: "bg-amber-500",
            pulse: true
        };
    }
    return {
        label: "Feed Online",
        pillClass: "border border-teal-200 bg-teal-50 text-teal-700 shadow-[0_12px_30px_rgba(15,118,110,0.10)]",
        dotClass: "bg-teal-500",
        pulse: true
    };
}

function formatTime(date = new Date()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Mini Stat Cards ──────────────────────────────────────────────────────────
function MiniCard({ label, title, detail, tone = "purple" }) {
    const toneMap = {
        purple: { bar: "bg-violet-700", label: "text-violet-700", glow: "bg-violet-100" },
        teal:   { bar: "bg-teal-700",   label: "text-teal-700",   glow: "bg-teal-100" },
        blue:   { bar: "bg-blue-700",   label: "text-blue-700",   glow: "bg-blue-100" }
    };
    const toneStyles = toneMap[tone] ?? toneMap.purple;

    return (
        <article className="group relative overflow-hidden rounded-[24px] border border-surface-200 bg-white p-6 shadow-[0_16px_32px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-surface-300 hover:shadow-[0_22px_48px_rgba(15,23,42,0.10)]">
            <div className={`absolute inset-x-0 top-0 h-1 ${toneStyles.bar}`}></div>
            <div className={`absolute right-5 top-5 h-16 w-16 rounded-full ${toneStyles.glow} opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100`}></div>
            <p className={`relative text-xs font-bold uppercase tracking-[0.24em] ${toneStyles.label}`}>{label}</p>
            <h3 className="relative mt-3 text-2xl font-bold tracking-tight text-surface-900">{title}</h3>
            <p className="relative mt-3 text-sm leading-7 text-surface-600">{detail}</p>
        </article>
    );
}

// ─── Table Empty / Error State ────────────────────────────────────────────────
function TableState({ message, error = false }) {
    return (
        <tr>
            <td colSpan="6" className={`px-6 py-20 text-center text-sm ${error ? "bg-rose-50 text-rose-700" : "bg-surface-50 text-surface-500"} break-words`}>
                {!error && (
                    <div className="flex flex-col items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-semibold">{message}</p>
                    </div>
                )}
                {error && <p className="font-semibold">{message}</p>}
            </td>
        </tr>
    );
}

// ─── AI Analysis Modal ────────────────────────────────────────────────────────
function AiModal({ result, onClose }) {
    if (!result) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-surface-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.22)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="border-b border-surface-200 bg-gradient-to-br from-surface-900 to-blue-950 px-7 py-5">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-400">AEGIS AI Engine</p>
                    <h3 className="mt-1 text-xl font-extrabold tracking-tight text-white">Threat Analysis Report</h3>
                    <p className="mt-1 font-mono text-xs text-surface-400">{result.ai_model}</p>
                </div>

                {/* Body */}
                <div className="px-7 py-6">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold uppercase tracking-wider text-surface-500">Threat Level:</span>
                        <span className={`text-base ${getThreatLevelClasses(result.threat_level)}`}>{result.threat_level}</span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-surface-700">{result.analysis}</p>
                </div>

                {/* Footer */}
                <div className="border-t border-surface-100 bg-surface-50 px-7 py-4 text-right">
                    <button
                        onClick={onClose}
                        className="rounded-full bg-surface-900 px-6 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,23,42,0.20)] transition-all hover:bg-blue-700"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Notification Toast ───────────────────────────────────────────────────────
function Toast({ message, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 5000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 shadow-[0_20px_50px_rgba(190,24,93,0.15)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
            <p className="text-sm font-semibold text-rose-700">{message}</p>
            <button onClick={onClose} className="ml-2 text-rose-400 hover:text-rose-700">✕</button>
        </div>
    );
}

// ─── Log Table Rows ───────────────────────────────────────────────────────────
function EventRows({ logs, loading, error, emptyMessage, onAnalyze, analyzingId }) {
    if (loading) return <TableState message="Loading the local event feed..." />;
    if (error) return <TableState message={error} error={true} />;
    if (!logs.length) return <TableState message={emptyMessage} />;

    return logs.map((log) => {
        const rowKey = log.id ?? `${log.timestamp}-${log.source_ip}-${log.event_type}`;
        const isAnalyzing = analyzingId === rowKey;

        return (
            <tr
                key={rowKey}
                className="group border-b border-surface-200 transition-colors last:border-b-0 hover:bg-blue-50/70"
            >
                <td className="px-6 py-4 text-sm font-medium text-surface-700 transition-colors group-hover:text-surface-900 sm:whitespace-nowrap">
                    {log.timestamp}
                </td>
                <td className="px-6 py-4">
                    <span className={`inline-flex min-w-[80px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 group-hover:scale-105 sm:min-w-[100px] ${getSeverityClasses(log.severity)}`}>
                        {String(log.severity ?? "INFO").toUpperCase()}
                    </span>
                </td>
                <td className="px-6 py-4 font-mono text-sm text-surface-700 transition-colors group-hover:text-blue-700 sm:whitespace-nowrap">
                    {log.source_ip}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-surface-800 sm:whitespace-nowrap">
                    {log.event_type}
                </td>
                <td className="max-w-sm px-6 py-4 text-sm leading-7 text-surface-600 transition-colors group-hover:text-surface-800">
                    {log.message}
                </td>
                <td className="px-6 py-4">
                    <button
                        onClick={() => onAnalyze(log, rowKey)}
                        disabled={isAnalyzing}
                        className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 shadow-[0_6px_14px_rgba(109,40,217,0.10)] transition-all duration-300 hover:bg-violet-700 hover:text-white hover:shadow-[0_10px_22px_rgba(109,40,217,0.22)] disabled:cursor-not-allowed disabled:opacity-60 sm:whitespace-nowrap"
                    >
                        {isAnalyzing ? (
                            <>
                                <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                                </svg>
                                Scanning...
                            </>
                        ) : (
                            <>
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                Analyze with AEGIS AI
                            </>
                        )}
                    </button>
                </td>
            </tr>
        );
    });
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
    const [logs, setLogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [lastSync, setLastSync] = useState("Waiting for the local API...");
    const [toast, setToast] = useState("");
    const [analyzingId, setAnalyzingId] = useState(null);
    const [aiModal, setAiModal] = useState(null);

    // Debounced search value — triggers API fetch after 350ms of no typing
    const deferredQuery = useDeferredValue(searchQuery);

    // ── Fetch Logs from Backend FTS5 ─────────────────────────────────────────
    const fetchLogs = useCallback(async (options = {}) => {
        const isManualRefresh = Boolean(options.manual);
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);
        setError("");

        try {
            // Send the query directly to the backend FTS5 engine for real search
            const url = new URL(API_LOGS_URL);
            if (options.query && options.query.trim()) {
                url.searchParams.set("search", options.query.trim());
            }
            url.searchParams.set("limit", "200");

            const response = await fetch(url.toString(), { method: "GET" });

            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

            const data = await response.json();
            const nextLogs = Array.isArray(data.logs) ? data.logs : [];

            startTransition(() => setLogs(nextLogs));
            setLastSync(`Last sync ${formatTime()} from the local analyst endpoint.`);
        } catch (fetchError) {
            console.error("Failed to fetch logs:", fetchError);
            startTransition(() => setLogs([]));
            setError("Unable to reach 127.0.0.1:8000/api/logs. Confirm the local API or Docker container is running.");
            setLastSync("Local API unavailable. The interface is ready as soon as the backend comes online.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Re-fetch from backend when search query changes (real FTS5 search)
    useEffect(() => {
        fetchLogs({ query: deferredQuery });
    }, [deferredQuery, fetchLogs]);

    // ── Analyze Log with AEGIS AI ─────────────────────────────────────────────
    const handleAnalyze = useCallback(async (log, rowKey) => {
        setAnalyzingId(rowKey);
        try {
            const response = await fetch(API_ANALYZE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: log.message,
                    severity: log.severity,
                    event_type: log.event_type
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();
            setAiModal(result);
        } catch (err) {
            console.error("AI analysis failed:", err);
            setToast("AEGIS AI engine unreachable. Ensure the backend is online and try again.");
        } finally {
            setAnalyzingId(null);
        }
    }, []);

    const activeFilter = deferredQuery.trim();
    const emptyMessage = activeFilter
        ? `No anomalies detected for "${activeFilter}".`
        : "No events returned by the local analyst API.";
    const displayedCount = error ? 0 : logs.length;
    const statusMessage = activeFilter
        ? `Showing FTS5 results for "${activeFilter}" from the SQLite index.`
        : lastSync;
    const systemState = getSystemState({ error, loading });

    return (
        <div
            className="relative min-h-screen overflow-x-hidden bg-surface-50 text-surface-900 selection:bg-blue-100 selection:text-blue-900"
            style={{
                backgroundImage:
                    "radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 30%), radial-gradient(circle at top right, rgba(20, 184, 166, 0.10), transparent 26%), linear-gradient(180deg, #f8fbff 0%, #f8fafc 44%, #eef4ff 100%)"
            }}
        >
            {/* Background blobs */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute left-0 top-0 h-[220px] w-[220px] animate-drift-slow rounded-full bg-blue-200/60 blur-[90px] sm:-left-16 sm:h-[340px] sm:w-[340px] sm:blur-[95px]"></div>
                <div className="absolute right-0 top-20 h-[220px] w-[220px] animate-drift-medium rounded-full bg-teal-200/55 blur-[95px] sm:-right-20 sm:top-24 sm:h-[360px] sm:w-[360px] sm:blur-[110px]"></div>
                <div className="absolute bottom-0 left-1/3 h-[180px] w-[180px] animate-drift-slow rounded-full bg-rose-100 blur-[90px] sm:h-[280px] sm:w-[280px] sm:blur-[100px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:56px_56px]"></div>
            </div>

            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* ── Hero Header ─────────────────────────────────────────────── */}
                <section className={`${panelClass} px-5 py-6 sm:px-10 sm:py-8`}>
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-700">
                                Offline Cyber Defense Console
                            </p>
                            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
                                <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-surface-900 sm:text-5xl">
                                    AEGIS <span className="block text-blue-700 sm:inline">SOC Analyst</span>
                                </h1>
                                <span className="inline-flex w-fit items-center rounded-full border border-surface-200 bg-surface-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.20em] text-surface-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                                    Offline Mode
                                </span>
                            </div>
                            <p className="mt-5 max-w-2xl text-base leading-8 text-surface-700">
                                Advanced local security review, fast triage, and clean analyst handoffs designed for air-gapped workflows.
                            </p>
                        </div>

                        <div className="flex flex-col items-start gap-3 lg:items-end">
                            <div className={`inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-sm font-bold ${systemState.pillClass}`}>
                                <span className="relative flex h-3 w-3">
                                    {systemState.pulse ? (
                                        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${systemState.dotClass} opacity-30`}></span>
                                    ) : null}
                                    <span className={`relative inline-flex h-3 w-3 rounded-full ${systemState.dotClass}`}></span>
                                </span>
                                <span>{systemState.label}</span>
                            </div>
                            <p className="max-w-xs break-all font-mono text-xs text-surface-500 sm:text-right sm:break-normal">
                                Endpoint: 127.0.0.1:8000/api/logs
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── Search + Intake Row ──────────────────────────────────────── */}
                <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">

                    {/* FTS5 Search Bar */}
                    <section className={`${panelClass} flex min-h-[280px] flex-col justify-between p-5 sm:p-8`}>
                        <div>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">Live Query</p>
                                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-surface-900">Filter Events In-Place</h2>
                                </div>
                            </div>

                            <div className="group mt-8 rounded-[24px] border border-surface-200 bg-surface-50/80 p-1 transition-all duration-300 focus-within:border-blue-200 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(191,219,254,0.55)]">
                                <label className="flex items-center gap-4 rounded-[20px] bg-white px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-surface-500 transition-colors group-focus-within:text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        placeholder="Search severity, provider, or message... (powered by SQLite FTS5)"
                                        className="w-full bg-transparent text-base font-medium text-surface-900 outline-none placeholder:text-surface-400"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery("")} className="text-surface-400 hover:text-surface-700">
                                            ✕
                                        </button>
                                    )}
                                </label>
                            </div>
                        </div>

                        <p className="mt-6 max-w-3xl text-sm leading-7 text-surface-600">
                            Search is powered by the SQLite FTS5 engine on the backend — not client-side filtering. Results are sub-millisecond.
                        </p>
                    </section>

                    {/* File Intake */}
                    <section className={`${panelClass} flex flex-col p-5 sm:p-8`}>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-700">Ingest</p>
                                <h2 className="mt-2 text-3xl font-bold tracking-tight text-surface-900">File Intake</h2>
                            </div>
                        </div>

                        <div className="group relative mt-6 flex flex-1 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[24px] border-2 border-dashed border-surface-300 bg-surface-50 px-6 py-10 text-center transition-all duration-300 hover:border-blue-300 hover:bg-white hover:shadow-[0_20px_50px_rgba(37,99,235,0.08)]">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-teal-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                            <div className="relative z-10 transition-transform duration-300 group-hover:-translate-y-1">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-[0_10px_24px_rgba(37,99,235,0.10)]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <p className="mt-5 text-lg font-bold text-surface-900">Drop Log File Here</p>
                                <p className="mt-2 text-sm font-medium text-surface-600">Or click to browse</p>
                            </div>
                        </div>
                    </section>
                </section>

                {/* ── Stat Cards ───────────────────────────────────────────────── */}
                <section className="mt-8 grid gap-6 md:grid-cols-3">
                    <MiniCard label="Architecture" title="Air-Gapped Ready" detail="Designed to stay fully functional even when isolated from external networks." tone="purple" />
                    <MiniCard label="Data Source" title="Local Pipeline" detail="Real-time fetching directly from the workstation's local analyst API." tone="teal" />
                    <MiniCard label="Experience" title="Clean Triage" detail="Balanced density and modern aesthetics for frictionless log review." tone="blue" />
                </section>

                {/* ── Event Feed Table ─────────────────────────────────────────── */}
                <section className={`${panelClass} mt-8 overflow-hidden`}>
                    <div className="flex flex-col gap-5 border-b border-surface-200 bg-surface-50/80 px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-surface-600">Security Stream</p>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-surface-900">Event Feed</h2>
                            <p className="mt-2 text-sm font-medium text-surface-600">{statusMessage}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.20em] text-blue-700 shadow-[0_8px_18px_rgba(37,99,235,0.08)]">
                                {displayedCount} Events
                            </span>
                            <button
                                type="button"
                                onClick={() => fetchLogs({ manual: true, query: searchQuery })}
                                disabled={loading || refreshing}
                                className="inline-flex items-center justify-center rounded-full bg-blue-700 px-6 py-2.5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(29,78,216,0.25)] transition-all duration-300 hover:bg-blue-800 hover:shadow-[0_18px_34px_rgba(29,78,216,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span className="flex items-center gap-2">
                                    <svg className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    {refreshing ? "Refreshing..." : "Sync Feed"}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="border-b border-surface-200 bg-surface-50">
                                <tr>
                                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-[0.20em] text-surface-600">Timestamp</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-[0.20em] text-surface-600">Severity</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-[0.20em] text-surface-600">Source</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-[0.20em] text-surface-600">Event Type</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-[0.20em] text-surface-600">Message</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-[0.20em] text-surface-600">AEGIS AI</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                <EventRows
                                    logs={logs}
                                    loading={loading}
                                    error={error}
                                    emptyMessage={emptyMessage}
                                    onAnalyze={handleAnalyze}
                                    analyzingId={analyzingId}
                                />
                            </tbody>
                        </table>
                    </div>
                </section>

            </main>

            {/* ── AI Analysis Modal ──────────────────────────────────────────── */}
            <AiModal result={aiModal} onClose={() => setAiModal(null)} />

            {/* ── Error Toast ────────────────────────────────────────────────── */}
            {toast && <Toast message={toast} onClose={() => setToast("")} />}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
