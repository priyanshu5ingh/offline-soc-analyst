import { motion } from 'framer-motion';
import { Shield, X, AlertTriangle, AlertCircle } from 'lucide-react';

const threatThemes = {
  Critical: { bg: '#fee2e2', border: '#fecaca', text: '#991b1b', glow: 'rgba(239,68,68,0.15)', icon: AlertTriangle },
  High:     { bg: '#ffedd5', border: '#fed7aa', text: '#9a3412', glow: 'rgba(249,115,22,0.15)', icon: AlertCircle },
  Medium:   { bg: '#fef3c7', border: '#fde68a', text: '#92400e', glow: 'rgba(234,179,8,0.15)',  icon: AlertCircle },
  Low:      { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', glow: 'rgba(16,185,129,0.1)',  icon: Shield },
};

export default function AnalysisModal({ log, result, onClose }) {
  const t = threatThemes[result.threat_level] || threatThemes.Low;
  const ThreatIcon = t.icon;

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
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        className="glass-strong overflow-hidden bg-white"
        style={{
          width: '100%', maxWidth: 580,
          boxShadow: `0 0 60px ${t.glow}, 0 20px 40px -10px rgba(0,0,0,0.1)`,
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '28px 32px 20px',
          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="mono text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#4f46e5' }}>
                // AEGIS AI Engine — Threat Analysis Report
              </p>
              <h3 className="mt-2 text-xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>
                Forensic Intelligence Output
              </h3>
              <p className="mono text-[11px] mt-1.5 font-semibold" style={{ color: '#64748b' }}>
                Model: {result.ai_model}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-colors hover:bg-slate-200"
              style={{ color: '#64748b' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Threat Level Banner */}
        <div className="flex items-center gap-3" style={{
          padding: '14px 32px',
          background: t.bg,
          borderBottom: `1px solid ${t.border}`,
        }}>
          <ThreatIcon size={16} style={{ color: t.text }} />
          <span className="mono text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: t.text, opacity: 0.8 }}>
            Threat Level:
          </span>
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.4, delay: 0.15 }}
            className="font-display text-lg font-black"
            style={{ color: t.text }}
          >
            {result.threat_level}
          </motion.span>
        </div>

        {/* Analysis */}
        <div style={{ padding: '28px 32px' }}>
          <p className="mono text-[10px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: '#64748b' }}>
            // Recommended IR Action
          </p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm leading-7 font-medium"
            style={{ color: '#334155' }}
          >
            {result.analysis}
          </motion.p>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 32px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mono text-sm font-bold px-6 py-2.5 rounded-xl shadow-sm"
            style={{
              background: '#fff',
              border: '1px solid #cbd5e1',
              color: '#475569',
            }}
          >
            [ DISMISS ]
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
