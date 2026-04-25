import { motion } from 'framer-motion';
import { Shield, X, AlertTriangle, AlertCircle } from 'lucide-react';

const threatThemes = {
  Critical: { bg: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(190,18,60,0.08))', border: 'rgba(239,68,68,0.25)', text: '#fca5a5', glow: 'rgba(239,68,68,0.25)', icon: AlertTriangle },
  High:     { bg: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(234,88,12,0.08))', border: 'rgba(249,115,22,0.25)', text: '#fdba74', glow: 'rgba(249,115,22,0.25)', icon: AlertCircle },
  Medium:   { bg: 'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(202,138,4,0.08))',  border: 'rgba(234,179,8,0.2)',   text: '#fde68a', glow: 'rgba(234,179,8,0.2)',  icon: AlertCircle },
  Low:      { bg: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.06))',   border: 'rgba(16,185,129,0.2)',  text: '#6ee7b7', glow: 'rgba(16,185,129,0.15)', icon: Shield },
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
        initial={{ opacity: 0, scale: 0.92, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 40 }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
        className="glass-strong overflow-hidden"
        style={{
          width: '100%', maxWidth: 580,
          boxShadow: `0 0 80px ${t.glow}, 0 25px 80px -20px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Chrome edge */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), rgba(255,255,255,0.15), rgba(255,255,255,0.08), transparent)',
        }} />

        {/* Header */}
        <div style={{
          padding: '28px 32px 20px',
          background: 'linear-gradient(135deg, rgba(10,10,30,0.95), rgba(20,10,40,0.95))',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="mono text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#6366f1' }}>
                // AEGIS AI Engine — Threat Analysis Report
              </p>
              <h3 className="mt-2 text-xl font-extrabold tracking-tight" style={{ color: '#e2e8f0' }}>
                Forensic Intelligence Output
              </h3>
              <p className="mono text-[11px] mt-1.5" style={{ color: '#374151' }}>
                Model: {result.ai_model}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-colors hover:bg-white/5"
              style={{ color: '#4b5563' }}
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
          <span className="mono text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: '#4b5563' }}>
            Threat Level:
          </span>
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.4, delay: 0.15 }}
            className="font-display text-lg font-black"
            style={{ color: t.text, textShadow: `0 0 16px ${t.glow}` }}
          >
            {result.threat_level}
          </motion.span>
        </div>

        {/* Analysis */}
        <div style={{ padding: '28px 32px' }}>
          <p className="mono text-[10px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: '#4b5563' }}>
            // Recommended IR Action
          </p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm leading-7"
            style={{ color: '#94a3b8' }}
          >
            {result.analysis}
          </motion.p>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 32px',
          borderTop: '1px solid rgba(255,255,255,0.03)',
          background: 'rgba(0,0,0,0.15)',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mono text-sm font-bold px-6 py-2.5 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08))',
              border: '1px solid rgba(99,102,241,0.2)',
              color: '#818cf8',
              boxShadow: '0 1px 0 0 rgba(255,255,255,0.05) inset',
            }}
          >
            [ DISMISS ]
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
