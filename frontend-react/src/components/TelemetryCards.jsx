import { motion } from 'framer-motion';
import { Database, Gauge, Cpu, HardDrive, AlertTriangle } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', bounce: 0.2, duration: 0.8, delay: i * 0.08 },
  }),
};

function MetricCard({ index, accentColor, gradientFrom, gradientTo, label, icon: Icon, children }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
      className="metal-card"
      style={{ 
        perspective: 1000, 
        minWidth: 220, 
        maxWidth: 280, /* Restricts the cards from expanding too wide */
        flex: '1 1 auto',
        padding: '24px'
      }}
    >
      {/* Accent bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{
        background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
      }} />

      {/* Label */}
      <div className="flex items-center gap-2 mb-4 mt-2">
        <Icon size={14} style={{ color: accentColor }} />
        <p className="mono text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: '#475569' }}>
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
    <div className="flex flex-wrap gap-5 mb-8 justify-start">

      {/* ── Total Events ─────────────────────────────────────────────── */}
      <MetricCard index={0} accentColor="#0284c7"
        gradientFrom="#0284c7" gradientTo="#3b82f6" label="Indexed Events" icon={Database}>
        <p className="font-display text-4xl font-black tracking-tight" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
          {total.toLocaleString()}
        </p>
        <p className="mono text-[10px] mt-2 font-semibold" style={{ color: '#64748b' }}>
          ENTRIES IN FTS5 INDEX
        </p>
        <div className="mt-5 h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #0284c7, #3b82f6)' }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (total / 500) * 100)}%` }}
            transition={{ type: 'spring', bounce: 0.1, duration: 1.5, delay: 0.3 }}
          />
        </div>
      </MetricCard>

      {/* ── Query Latency ────────────────────────────────────────────── */}
      <MetricCard index={1} accentColor="#059669"
        gradientFrom="#059669" gradientTo="#10b981" label="Query Latency" icon={Gauge}>
        <div className="flex items-baseline gap-1.5">
          <p className="font-display text-4xl font-black tracking-tight" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
            {latency}
          </p>
          <span className="mono text-sm font-bold" style={{ color: '#059669' }}>ms</span>
        </div>
        <p className="mono text-[10px] mt-2 font-semibold" style={{ color: '#64748b' }}>
          LAST FTS5 EXECUTION TIME
        </p>
        <div className="mt-5 h-1.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #059669, #10b981)' }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (latency / 200) * 100)}%` }}
            transition={{ type: 'spring', bounce: 0.1, duration: 1.2, delay: 0.4 }}
          />
        </div>
      </MetricCard>

      {/* ── AI Engine Status ─────────────────────────────────────────── */}
      <MetricCard index={2} accentColor="#7c3aed"
        gradientFrom="#7c3aed" gradientTo="#9333ea" label="AI Engine Status" icon={Cpu}>
        <div className="flex items-center gap-2.5 mt-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: '#10b981', opacity: 0.4 }} />
            <span className="relative inline-flex h-3 w-3 rounded-full" style={{ background: '#10b981' }} />
          </span>
          <p className="font-display text-lg font-black tracking-wide" style={{ color: '#4f46e5' }}>
            [ ONLINE ]
          </p>
        </div>
        <p className="mono text-[11px] mt-3 font-bold" style={{ color: '#6d28d9' }}>
          AEGIS-LLAMA3-8B
        </p>
        <p className="mono text-[10px] mt-1 font-semibold" style={{ color: '#64748b' }}>
          HEURISTIC EXPERT ACTIVE
        </p>
      </MetricCard>

      {/* ── Active DB Pool ───────────────────────────────────────────── */}
      <MetricCard index={3} accentColor="#d97706"
        gradientFrom="#d97706" gradientTo="#f59e0b" label="Active DB Pool" icon={HardDrive}>
        <p className="font-display text-base font-bold" style={{ color: '#b45309' }}>
          SQLITE FTS5
        </p>
        <p className="mono text-[10px] mt-1 font-semibold" style={{ color: '#64748b' }}>
          IN-MEMORY CACHE LAYER
        </p>
        <div className="flex items-end gap-1 mt-5">
          {[0.9, 0.55, 0.85, 0.4, 0.75, 0.6, 0.95, 0.5].map((h, i) => (
            <motion.div
              key={i}
              className="w-2 rounded-sm"
              style={{ background: `linear-gradient(180deg, #f59e0b, #d97706)`, opacity: h }}
              initial={{ height: 0 }}
              animate={{ height: h * 24 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.8, delay: 0.4 + i * 0.06 }}
            />
          ))}
          <span className="mono text-[10px] ml-2 font-bold" style={{ color: '#059669' }}>HEALTHY</span>
        </div>
      </MetricCard>

      {/* ── Threat Mix ───────────────────────────────────────────────── */}
      <MetricCard index={4} accentColor="#dc2626"
        gradientFrom="#dc2626" gradientTo="#ef4444" label="Threat Mix" icon={AlertTriangle}>
        <div className="space-y-3 mt-1">
          {[
            { label: 'CRITICAL / ERR', value: criticals, color: '#dc2626' },
            { label: 'WARNING', value: warnings, color: '#d97706' },
            { label: 'INFO', value: infos, color: '#0284c7' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center mono text-[11px] font-bold">
              <span style={{ color: '#475569' }}>{label}</span>
              <span className="font-display text-base" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>
      </MetricCard>
    </div>
  );
}
