import { motion } from 'framer-motion';
import { Shield, X } from 'lucide-react';

const threatColors = {
  Critical: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(248,113,113,0.3)', text: '#f87171', glow: 'rgba(239,68,68,0.3)' },
  High:     { bg: 'rgba(249,115,22,0.1)', border: 'rgba(251,146,60,0.3)',  text: '#fb923c', glow: 'rgba(249,115,22,0.3)' },
  Medium:   { bg: 'rgba(234,179,8,0.1)',  border: 'rgba(250,204,21,0.3)',  text: '#facc15', glow: 'rgba(234,179,8,0.3)' },
  Low:      { bg: 'rgba(34,197,94,0.1)',  border: 'rgba(74,222,128,0.3)',  text: '#4ade80', glow: 'rgba(34,197,94,0.3)' },
};

export default function AnalysisModal({ log, result, onClose }) {
  const tc = threatColors[result.threat_level] || threatColors.Low;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        className="glass-strong overflow-hidden"
        style={{ width: '100%', maxWidth: 560, boxShadow: `0 0 60px ${tc.glow}` }}
      >
        {/* Header */}
        <div
          className="px-7 py-5 flex items-start justify-between"
          style={{ borderBottom: '1px solid rgba(99,102,241,0.15)', background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,27,75,0.95))' }}
        >
          <div>
            <p className="mono text-xs font-bold uppercase tracking-[0.15em]" style={{ color: '#6366f1' }}>
              // AEGIS AI Engine — Threat Analysis Report
            </p>
            <h3 className="mt-2 text-xl font-extrabold tracking-tight" style={{ color: '#e2e8f0' }}>
              Forensic Intelligence Output
            </h3>
            <p className="mono text-xs mt-1" style={{ color: '#475569' }}>
              Model: {result.ai_model}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Threat Level Banner */}
        <div
          className="px-7 py-3 flex items-center gap-3"
          style={{ background: tc.bg, borderBottom: `1px solid ${tc.border}` }}
        >
          <Shield size={16} style={{ color: tc.text }} />
          <span className="mono text-xs font-bold uppercase tracking-[0.15em]" style={{ color: '#64748b' }}>
            Threat Level:
          </span>
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.4, delay: 0.2 }}
            className="mono text-lg font-extrabold"
            style={{ color: tc.text, textShadow: `0 0 12px ${tc.glow}` }}
          >
            {result.threat_level}
          </motion.span>
        </div>

        {/* Analysis Body */}
        <div className="px-7 py-6">
          <p className="mono text-xs font-bold uppercase tracking-[0.15em] mb-3" style={{ color: '#475569' }}>
            // Recommended IR Action
          </p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-sm leading-7"
            style={{ color: '#94a3b8' }}
          >
            {result.analysis}
          </motion.p>
        </div>

        {/* Footer */}
        <div
          className="px-7 py-4 flex justify-end"
          style={{ borderTop: '1px solid rgba(99,102,241,0.1)', background: 'rgba(15,23,42,0.4)' }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mono text-sm font-bold px-6 py-2.5 rounded-full transition-all"
            style={{
              background: 'rgba(99,102,241,0.12)',
              border: '1.5px solid rgba(99,102,241,0.3)',
              color: '#818cf8',
            }}
          >
            [ DISMISS ]
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
