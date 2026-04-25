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
      {/* Metallic top edge */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.08) 80%, transparent 100%)',
      }} />

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
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.15), 0 8px 32px -4px rgba(0,0,0,0.4), 0 1px 0 0 rgba(255,255,255,0.2) inset',
                transformStyle: 'preserve-3d',
                perspective: 800,
                flexShrink: 0,
              }}
            >
              <Shield size={30} color="#fff" strokeWidth={1.6} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            </motion.div>

            <div>
              {/* Subtitle */}
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#6366f1' }}>
                AEGIS — OFFLINE CYBER DEFENSE CONSOLE
              </p>

              {/* Main Title — Holographic */}
              <h1 className="mt-1 flex items-baseline gap-3">
                <span className="holo-text font-display text-3xl font-black tracking-tight sm:text-4xl" style={{ lineHeight: 1.1 }}>
                  SOC LOG ANALYST
                </span>
                <span className="mono text-sm font-bold" style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15))',
                  border: '1px solid rgba(99,102,241,0.2)',
                  padding: '2px 10px',
                  borderRadius: 8,
                  color: '#818cf8',
                  fontSize: 11,
                }}>
                  v2.0
                </span>
              </h1>

              {/* Tagline */}
              <p className="mt-1.5 text-[13px] font-medium" style={{ color: '#475569' }}>
                Air-gapped forensic triage
                <span style={{ color: '#334155', margin: '0 8px' }}>·</span>
                SQLite FTS5 full-text search
                <span style={{ color: '#334155', margin: '0 8px' }}>·</span>
                Local AI inference engine
              </p>
            </div>
          </div>

          {/* ── Right: Status Pills ───────────────────────────────────────── */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Air-Gapped Badge */}
            <div className="status-pill" style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 100%)',
              border: '1px solid rgba(16,185,129,0.2)',
              color: '#6ee7b7',
            }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: '#34d399', opacity: 0.4 }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: '#34d399' }} />
              </span>
              AIR-GAPPED
            </div>

            {/* Backend Status */}
            <div className="status-pill" style={{
              background: isOnline
                ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))'
                : isOffline
                ? 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(190,18,60,0.08))'
                : 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.08))',
              border: `1px solid ${isOnline ? 'rgba(16,185,129,0.25)' : isOffline ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
              color: isOnline ? '#6ee7b7' : isOffline ? '#fca5a5' : '#fde68a',
            }}>
              {isOnline ? <Wifi size={12} /> : isOffline ? <WifiOff size={12} /> : <Loader2 size={12} className="animate-spin" />}
              {isOnline ? 'BACKEND ONLINE' : isOffline ? 'BACKEND OFFLINE' : 'CONNECTING…'}
            </div>
          </div>
        </div>
      </div>

      {/* Metallic bottom edge */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), rgba(168,85,247,0.15), rgba(6,182,212,0.1), transparent)',
      }} />
    </motion.header>
  );
}
