import { motion } from 'framer-motion';
import { Database, Gauge, Cpu, HardDrive, AlertTriangle } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 40, rotateX: -8 },
  visible: (i) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { type: 'spring', bounce: 0.15, duration: 0.9, delay: i * 0.1 },
  }),
};

function MetricCard({ index, accentColor, accentGlow, gradientFrom, gradientTo, label, icon: Icon, children }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
      className="metal-card p-6"
      style={{ perspective: 1000 }}
    >
      <div className="scan-beam" />

      {/* Accent bar with 3D depth */}
      <div className="accent-bar-3d mb-5" style={{
        background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
        boxShadow: `0 0 12px ${accentGlow}`,
      }} />

      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <Icon size={12} style={{ color: '#4b5563', opacity: 0.7 }} />
        <p className="mono text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: '#4b5563' }}>
          {label}
        </p>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </motion.div>
  );
}

export default function TelemetryCards({ telemetry }) {
  const { total = 0, latency = 0, criticals = 0, warnings = 0, infos = 0 } = telemetry;

  return (
    <div className="grid gap-5 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>

      {/* ── Total Events ─────────────────────────────────────────────── */}
      <MetricCard index={0} accentColor="#06b6d4" accentGlow="rgba(6,182,212,0.3)"
        gradientFrom="#06b6d4" gradientTo="#3b82f6" label="Indexed Events" icon={Database}>
        <p className="font-display text-4xl font-black tracking-tight" style={{
          color: '#67e8f9',
          textShadow: '0 0 20px rgba(6,182,212,0.5), 0 0 40px rgba(6,182,212,0.2)',
          letterSpacing: '-0.02em',
        }}>
          {total.toLocaleString()}
        </p>
        <p className="mono text-[10px] mt-2 font-medium" style={{ color: '#374151' }}>
          ENTRIES IN FTS5 INDEX
        </p>
        <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(6,182,212,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #06b6d4, #3b82f6)', boxShadow: '0 0 8px rgba(6,182,212,0.5)' }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (total / 500) * 100)}%` }}
            transition={{ type: 'spring', bounce: 0.1, duration: 1.5, delay: 0.3 }}
          />
        </div>
      </MetricCard>

      {/* ── Query Latency ────────────────────────────────────────────── */}
      <MetricCard index={1} accentColor="#10b981" accentGlow="rgba(16,185,129,0.3)"
        gradientFrom="#10b981" gradientTo="#06b6d4" label="Query Latency" icon={Gauge}>
        <div className="flex items-baseline gap-1.5">
          <p className="font-display text-4xl font-black tracking-tight" style={{
            color: '#6ee7b7',
            textShadow: '0 0 20px rgba(16,185,129,0.5), 0 0 40px rgba(16,185,129,0.2)',
            letterSpacing: '-0.02em',
          }}>
            {latency}
          </p>
          <span className="mono text-sm font-bold" style={{ color: '#34d399' }}>ms</span>
        </div>
        <p className="mono text-[10px] mt-2 font-medium" style={{ color: '#374151' }}>
          LAST FTS5 EXECUTION TIME
        </p>
        <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(16,185,129,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4)', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (latency / 200) * 100)}%` }}
            transition={{ type: 'spring', bounce: 0.1, duration: 1.2, delay: 0.4 }}
          />
        </div>
      </MetricCard>

      {/* ── AI Engine Status ─────────────────────────────────────────── */}
      <MetricCard index={2} accentColor="#8b5cf6" accentGlow="rgba(139,92,246,0.3)"
        gradientFrom="#8b5cf6" gradientTo="#ec4899" label="AI Engine Status" icon={Cpu}>
        <div className="flex items-center gap-2.5 mt-1">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: '#34d399', opacity: 0.3 }} />
            <span className="relative inline-flex h-3 w-3 rounded-full" style={{
              background: 'linear-gradient(135deg, #34d399, #10b981)',
              boxShadow: '0 0 8px rgba(52,211,153,0.5)',
            }} />
          </span>
          <p className="font-display text-sm font-black tracking-wide" style={{
            color: '#c4b5fd',
            textShadow: '0 0 12px rgba(139,92,246,0.4)',
          }}>
            [ ONLINE ]
          </p>
        </div>
        <p className="mono text-[10px] mt-3 font-bold" style={{ color: '#7c3aed' }}>
          AEGIS-LLAMA3-8B-QUANTIZED
        </p>
        <p className="mono text-[10px] mt-1" style={{ color: '#374151' }}>
          HEURISTIC EXPERT SYSTEM ACTIVE
        </p>
      </MetricCard>

      {/* ── Active DB Pool ───────────────────────────────────────────── */}
      <MetricCard index={3} accentColor="#f59e0b" accentGlow="rgba(245,158,11,0.3)"
        gradientFrom="#f59e0b" gradientTo="#ef4444" label="Active DB Pool" icon={HardDrive}>
        <p className="font-display text-sm font-bold" style={{
          color: '#fcd34d',
          textShadow: '0 0 12px rgba(245,158,11,0.4)',
        }}>
          SQLITE FTS5
        </p>
        <p className="mono text-[10px] mt-1" style={{ color: '#d97706' }}>
          IN-MEMORY CACHE LAYER
        </p>
        <div className="flex items-end gap-1 mt-4">
          {[0.9, 0.55, 0.85, 0.4, 0.75, 0.6, 0.95, 0.5].map((h, i) => (
            <motion.div
              key={i}
              className="w-2 rounded-sm"
              style={{
                background: `linear-gradient(180deg, #fbbf24, #f59e0b)`,
                opacity: h,
                boxShadow: `0 0 4px rgba(251,191,36,${h * 0.3})`,
              }}
              initial={{ height: 0 }}
              animate={{ height: h * 28 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.8, delay: 0.4 + i * 0.06 }}
            />
          ))}
          <span className="mono text-[10px] ml-2 font-bold" style={{ color: '#374151' }}>HEALTHY</span>
        </div>
      </MetricCard>

      {/* ── Threat Mix ───────────────────────────────────────────────── */}
      <MetricCard index={4} accentColor="#ef4444" accentGlow="rgba(239,68,68,0.3)"
        gradientFrom="#ef4444" gradientTo="#f97316" label="Threat Mix" icon={AlertTriangle}>
        <div className="space-y-3">
          {[
            { label: 'CRITICAL / ERR', value: criticals, color: '#fca5a5', glow: 'rgba(239,68,68,0.4)' },
            { label: 'WARNING', value: warnings, color: '#fde68a', glow: 'rgba(234,179,8,0.3)' },
            { label: 'INFO', value: infos, color: '#67e8f9', glow: 'rgba(6,182,212,0.3)' },
          ].map(({ label, value, color, glow }) => (
            <div key={label} className="flex justify-between items-center mono text-[11px]">
              <span style={{ color }}>{label}</span>
              <span className="font-display font-bold text-sm" style={{ color, textShadow: `0 0 8px ${glow}` }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </MetricCard>
    </div>
  );
}
