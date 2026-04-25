import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Scan, Loader2, Radio } from 'lucide-react';
import AnalysisModal from './AnalysisModal';
import { analyzeLog as apiAnalyze } from '../api';

/* ── Severity Badge ────────────────────────────────────────────────────── */
function SeverityBadge({ severity }) {
  const sev = (severity || '').toUpperCase();
  const map = {
    CRITICAL: 'badge badge-critical', ERROR: 'badge badge-error',
    WARNING: 'badge badge-warning', WARN: 'badge badge-warning',
    INFORMATION: 'badge badge-info', INFO: 'badge badge-info',
  };
  return <span className={map[sev] || 'badge badge-low'}>{sev || 'UNKNOWN'}</span>;
}

/* ── Variants ──────────────────────────────────────────────────────────── */
const containerV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};
const rowV = {
  hidden:  { opacity: 0, y: 18, scale: 0.99 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', bounce: 0.15, duration: 0.6 } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

/* ── Main Component ────────────────────────────────────────────────────── */
export default function EventTable({ logs, totalCount, isLoading }) {
  const [analyzingId, setAnalyzingId] = useState(null);
  const [modalData, setModalData]     = useState(null);

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

  const tableKey = useMemo(() => logs.map(l => l.timestamp + l.message).join('|').slice(0, 120), [logs]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.12, duration: 0.9, delay: 0.35 }}
        className="glass-strong mb-10 overflow-hidden"
        style={{ padding: 0 }}
      >
        {/* ── Table Header Bar ────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          style={{
            padding: '20px 32px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <p className="mono text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#475569' }}>
                // Security Stream
              </p>
              <h2 className="mt-1 text-lg font-extrabold tracking-tight" style={{ color: '#0f172a' }}>
                Live Event Feed
              </h2>
            </div>

            <span className="mono inline-flex items-center rounded-lg px-3 py-1.5 text-[11px] font-bold" style={{
              background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8',
            }}>
              {totalCount.toLocaleString()} EVENTS
            </span>

            <span className="mono inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-bold" style={{
              background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857',
            }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: '#10b981', opacity: 0.4 }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#10b981' }} />
              </span>
              STREAM ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Activity size={13} style={{ color: '#64748b' }} />
            <span className="mono text-[11px]" style={{ color: '#64748b' }}>
              Showing top {Math.min(200, logs.length)} of {totalCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────────── */}
        <div className="overflow-x-auto bg-white/50">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Severity</th>
                <th>Source</th>
                <th>Event Type</th>
                <th>Message</th>
                <th style={{ textAlign: 'center' }}>AEGIS AI</th>
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              <motion.tbody
                key={tableKey}
                variants={containerV}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {isLoading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '80px 0', textAlign: 'center' }}>
                      <div className="flex flex-col items-center gap-4">
                        <div className="spinner" style={{ width: 32, height: 32 }} />
                        <span className="mono text-sm font-semibold" style={{ color: '#475569' }}>
                          Loading event feed…
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '80px 0', textAlign: 'center' }}>
                      <div className="flex flex-col items-center gap-4">
                        <Scan size={40} style={{ color: '#cbd5e1' }} />
                        <span className="mono text-sm font-semibold" style={{ color: '#475569' }}>
                          No events match the current query.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log, i) => {
                    const isLive = log.source_ip === 'LIVE_STREAM';
                    return (
                      <motion.tr
                        key={`${log.timestamp}-${i}`}
                        variants={rowV}
                        whileHover={{ backgroundColor: 'rgba(241, 245, 249, 0.8)' }}
                        style={{ cursor: 'default', transition: 'background-color 0.2s ease' }}
                      >
                        <td className="mono text-[12px] whitespace-nowrap" style={{ color: '#64748b' }}>
                          {String(log.timestamp || '')}
                        </td>
                        <td><SeverityBadge severity={log.severity} /></td>
                        <td className="whitespace-nowrap">
                          {isLive ? (
                            <span className="mono inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold" style={{
                              background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857',
                            }}>
                              <Radio size={9} />
                              LIVE
                            </span>
                          ) : (
                            <span className="mono text-[12px] font-semibold" style={{ color: '#475569' }}>{String(log.source_ip || '')}</span>
                          )}
                        </td>
                        <td className="mono text-[12px] font-semibold max-w-[180px] truncate" style={{ color: '#4f46e5' }} title={String(log.event_type || '')}>
                          {String(log.event_type || '')}
                        </td>
                        <td className="text-[12px] max-w-sm" style={{ color: '#334155', lineHeight: 1.8 }}>
                          {String(log.message || '')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => handleAnalyze(log, i)}
                            disabled={analyzingId === i}
                            className="mono inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[11px] font-bold transition-all disabled:opacity-40"
                            style={{
                              background: '#fff',
                              border: '1px solid #cbd5e1',
                              color: '#4f46e5',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                            }}
                          >
                            {analyzingId === i ? <Loader2 size={11} className="animate-spin" /> : <Scan size={11} />}
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

      {/* AI Modal */}
      <AnimatePresence>
        {modalData && (
          <AnalysisModal log={modalData.log} result={modalData.result} onClose={() => setModalData(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
