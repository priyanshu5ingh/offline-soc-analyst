import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Scan, Loader2 } from 'lucide-react';
import AnalysisModal from './AnalysisModal';
import { analyzeLog as apiAnalyze } from '../api';

// ── Severity Badge ───────────────────────────────────────────────────────
function SeverityBadge({ severity }) {
  const sev = (severity || '').toUpperCase();
  const map = {
    CRITICAL:    'badge badge-critical',
    ERROR:       'badge badge-error',
    WARNING:     'badge badge-warning',
    WARN:        'badge badge-warning',
    INFORMATION: 'badge badge-info',
    INFO:        'badge badge-info',
  };
  return <span className={map[sev] || 'badge badge-low'}>{sev || 'UNKNOWN'}</span>;
}

// ── Escape HTML ──────────────────────────────────────────────────────────
function esc(str) {
  return String(str || '');
}

// ── Row Animation Variants ───────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const rowVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.2, duration: 0.6 } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// ── Main Component ──────────────────────────────────────────────────────
export default function EventTable({ logs, totalCount, isLoading }) {
  const [analyzingId, setAnalyzingId] = useState(null);
  const [modalData, setModalData] = useState(null);

  const handleAnalyze = async (log, idx) => {
    setAnalyzingId(idx);
    try {
      const result = await apiAnalyze(log);
      setModalData({ log, result });
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzingId(null);
    }
  };

  const tableKey = useMemo(() => logs.map(l => l.timestamp + l.message).join('|').slice(0, 100), [logs]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.8, delay: 0.3 }}
        className="glass-strong mb-10 overflow-hidden"
      >
        {/* Table Header Bar */}
        <div
          className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8"
          style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(99,102,241,0.12)' }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <p className="mono text-xs font-bold uppercase tracking-[0.15em]" style={{ color: '#475569' }}>
                // Security Stream
              </p>
              <h2 className="mt-0.5 text-lg font-bold tracking-tight" style={{ color: '#e2e8f0' }}>
                Live Event Feed
              </h2>
            </div>
            <span
              className="mono inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}
            >
              {totalCount.toLocaleString()} EVENTS
            </span>
            <span
              className="mono inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ background: '#4ade80' }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#4ade80' }} />
              </span>
              STREAM ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={14} style={{ color: '#475569' }} />
            <span className="mono text-xs" style={{ color: '#475569' }}>
              Showing top {Math.min(200, logs.length)} of {totalCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Severity</th>
                <th>Source</th>
                <th>Event Type</th>
                <th>Message</th>
                <th>AEGIS AI</th>
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              <motion.tbody
                key={tableKey}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {isLoading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '80px 0', textAlign: 'center' }}>
                      <div className="flex flex-col items-center gap-3">
                        <div className="spinner" style={{ width: 28, height: 28 }} />
                        <span className="mono text-sm" style={{ color: '#475569' }}>Loading event feed…</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '80px 0', textAlign: 'center' }}>
                      <div className="flex flex-col items-center gap-3">
                        <Scan size={36} style={{ color: 'rgba(99,102,241,0.25)' }} />
                        <span className="mono text-sm" style={{ color: '#475569' }}>No events match the current query.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log, i) => {
                    const isLive = log.source_ip === 'LIVE_STREAM';
                    return (
                      <motion.tr
                        key={`${log.timestamp}-${i}`}
                        variants={rowVariants}
                        whileHover={{ backgroundColor: 'rgba(99,102,241,0.04)' }}
                        style={{ cursor: 'default' }}
                      >
                        <td className="mono text-xs whitespace-nowrap" style={{ color: '#64748b' }}>
                          {esc(log.timestamp)}
                        </td>
                        <td><SeverityBadge severity={log.severity} /></td>
                        <td className="whitespace-nowrap">
                          {isLive ? (
                            <span
                              className="mono inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold"
                              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80' }} />
                              LIVE
                            </span>
                          ) : (
                            <span className="mono text-xs" style={{ color: '#64748b' }}>{esc(log.source_ip)}</span>
                          )}
                        </td>
                        <td className="mono text-xs truncate max-w-[160px]" style={{ color: '#6366f1' }} title={esc(log.event_type)}>
                          {esc(log.event_type)}
                        </td>
                        <td className="text-xs max-w-sm" style={{ color: '#94a3b8', lineHeight: 1.75 }}>
                          {esc(log.message)}
                        </td>
                        <td>
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => handleAnalyze(log, i)}
                            disabled={analyzingId === i}
                            className="mono inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50"
                            style={{
                              background: 'rgba(99,102,241,0.1)',
                              border: '1px solid rgba(99,102,241,0.25)',
                              color: '#818cf8',
                            }}
                          >
                            {analyzingId === i ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Scan size={12} />
                            )}
                            {analyzingId === i ? 'ANALYZING…' : 'ANALYZE'}
                          </motion.button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>
      </motion.div>

      {/* AI Analysis Modal */}
      <AnimatePresence>
        {modalData && (
          <AnalysisModal
            log={modalData.log}
            result={modalData.result}
            onClose={() => setModalData(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
