import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function Header({ status }) {
  const statusColors = {
    online:  { bg: 'rgba(34,197,94,0.1)',  border: 'rgba(74,222,128,0.4)',  text: '#4ade80', dot: '#4ade80' },
    offline: { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(248,113,113,0.4)', text: '#f87171', dot: '#f87171' },
    loading: { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.4)',  text: '#fbbf24', dot: '#fbbf24' },
  };
  const s = statusColors[status] || statusColors.loading;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.15, duration: 0.8 }}
      className="glass-strong mb-6"
      style={{ padding: '24px 32px' }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              boxShadow: '0 6px 24px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,0.3)',
            }}
          >
            <Shield size={28} color="#fff" strokeWidth={1.8} />
          </div>
          <div>
            <p className="mono text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#6366f1' }}>
              AEGIS — Offline Cyber Defense Console
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#e2e8f0' }}>
              SOC Log Analyst <span className="mono text-base font-bold" style={{ color: '#6366f1' }}>v2.0</span>
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#64748b' }}>
              Air-gapped forensic triage · SQLite FTS5 · Local AI inference
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="mono inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.15em]"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.3)', color: '#4ade80' }}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#4ade80' }} />
            AIR-GAPPED
          </span>

          <span
            className="mono inline-flex items-center gap-3 rounded-full px-4 py-2 text-xs font-bold"
            style={{ background: s.bg, border: `1.5px solid ${s.border}`, color: s.text }}
          >
            <span className="relative flex h-2.5 w-2.5">
              {status === 'online' && (
                <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ background: s.dot }} />
              )}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: s.dot }} />
            </span>
            {status === 'online' ? 'BACKEND ONLINE' : status === 'offline' ? 'BACKEND OFFLINE' : 'CONNECTING…'}
          </span>
        </div>
      </div>
    </motion.header>
  );
}
