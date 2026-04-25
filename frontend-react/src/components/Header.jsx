import { motion } from 'framer-motion';
import { Shield, Wifi, WifiOff, Loader2 } from 'lucide-react';

export default function Header({ status }) {
  const isOnline  = status === 'online';
  const isOffline = status === 'offline';

  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.12, duration: 1 }}
      className="glass-strong mb-8 overflow-hidden"
      style={{ padding: 0 }}
    >
      <div style={{ padding: '28px 36px 24px' }}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* ── Left: Logo + Title ─────────────────────────────────────────── */}
          <div className="flex items-center gap-5">
            {/* 3D Shield Icon */}
            <motion.div
              whileHover={{ rotateY: 15, rotateX: -5, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                width: 60, height: 60, borderRadius: 18,
                background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(79,70,229,0.2), 0 2px 4px rgba(79,70,229,0.1), inset 0 2px 4px rgba(255,255,255,0.4)',
                transformStyle: 'preserve-3d',
                perspective: 800,
                flexShrink: 0,
              }}
            >
              <Shield size={30} color="#fff" strokeWidth={1.8} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
            </motion.div>

            <div>
              {/* Subtitle */}
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#4f46e5' }}>
                AEGIS — OFFLINE CYBER DEFENSE CONSOLE
              </p>

              {/* Main Title — Holographic Light */}
              <h1 className="mt-1 flex items-baseline gap-3">
                <span className="holo-text font-display text-3xl font-black tracking-tight sm:text-4xl" style={{ lineHeight: 1.1 }}>
                  SOC LOG ANALYST
                </span>
                <span className="mono text-sm font-bold" style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  padding: '2px 10px',
                  borderRadius: 8,
                  color: '#4f46e5',
                  fontSize: 11,
                }}>
                  v2.0
                </span>
              </h1>

              {/* Tagline */}
              <p className="mt-1.5 text-[13px] font-medium" style={{ color: '#64748b' }}>
                Air-gapped forensic triage
                <span style={{ color: '#cbd5e1', margin: '0 8px' }}>·</span>
                SQLite FTS5 full-text search
                <span style={{ color: '#cbd5e1', margin: '0 8px' }}>·</span>
                Local AI inference engine
              </p>
            </div>
          </div>

          {/* ── Right: Status Pills ───────────────────────────────────────── */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Air-Gapped Badge */}
            <div className="status-pill">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: '#10b981', opacity: 0.4 }} />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: '#10b981' }} />
              </span>
              <span style={{ color: '#059669' }}>AIR-GAPPED</span>
            </div>

            {/* Backend Status */}
            <div className="status-pill">
              {isOnline ? <Wifi size={14} color="#059669" /> : isOffline ? <WifiOff size={14} color="#dc2626" /> : <Loader2 size={14} color="#d97706" className="animate-spin" />}
              <span style={{ color: isOnline ? '#059669' : isOffline ? '#dc2626' : '#d97706' }}>
                {isOnline ? 'BACKEND ONLINE' : isOffline ? 'BACKEND OFFLINE' : 'CONNECTING…'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
