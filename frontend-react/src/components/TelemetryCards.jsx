import { motion } from 'framer-motion';
import { Database, Gauge, Cpu, HardDrive, AlertTriangle } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', bounce: 0.2, duration: 0.7, delay: i * 0.1 },
  }),
};

function Card({ index, borderColor, gradientFrom, gradientTo, label, children, icon: Icon }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300 } }}
      className="telem-card p-5"
      style={{ borderTopColor: borderColor }}
    >
      <div className="scan-line" />
      <div className="h-1 rounded-full mb-4" style={{ background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})` }} />
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={13} style={{ color: '#475569' }} />}
        <p className="mono text-xs font-bold uppercase tracking-[0.15em]" style={{ color: '#475569' }}>{label}</p>
      </div>
      {children}
    </motion.div>
  );
}

export default function TelemetryCards({ telemetry }) {
  const { total = 0, latency = 0, criticals = 0, warnings = 0, infos = 0 } = telemetry;

  return (
    <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
      {/* Total Indexed Events */}
      <Card index={0} borderColor="#22d3ee" gradientFrom="#22d3ee" gradientTo="#6366f1" label="// Indexed Events" icon={Database}>
        <p className="mono text-4xl font-extrabold" style={{ color: '#22d3ee', letterSpacing: -1, textShadow: '0 0 16px rgba(34,211,238,0.5)' }}>
          {total.toLocaleString()}
        </p>
        <p className="mono text-xs mt-1" style={{ color: '#475569' }}>ENTRIES IN FTS5 INDEX</p>
        <div className="mt-3 h-1.5 rounded-full" style={{ background: 'rgba(34,211,238,0.1)' }}>
          <motion.div
            className="h-1.5 rounded-full"
            style={{ background: 'linear-gradient(90deg, #22d3ee, #6366f1)' }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (total / 500) * 100)}%` }}
            transition={{ type: 'spring', bounce: 0.1, duration: 1.2 }}
          />
        </div>
      </Card>

      {/* Query Latency */}
      <Card index={1} borderColor="#4ade80" gradientFrom="#4ade80" gradientTo="#22d3ee" label="// Query Latency" icon={Gauge}>
        <div className="flex items-end gap-1">
          <p className="mono text-4xl font-extrabold" style={{ color: '#4ade80', letterSpacing: -1, textShadow: '0 0 16px rgba(74,222,128,0.5)' }}>
            {latency}
          </p>
          <span className="mono text-sm mb-1" style={{ color: '#4ade80' }}>ms</span>
        </div>
        <p className="mono text-xs mt-1" style={{ color: '#475569' }}>LAST FTS5 EXECUTION TIME</p>
        <div className="mt-3 h-1.5 rounded-full" style={{ background: 'rgba(74,222,128,0.1)' }}>
          <motion.div
            className="h-1.5 rounded-full"
            style={{ background: 'linear-gradient(90deg, #4ade80, #22d3ee)' }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (latency / 200) * 100)}%` }}
            transition={{ type: 'spring', bounce: 0.1, duration: 1 }}
          />
        </div>
      </Card>

      {/* AI Engine Status */}
      <Card index={2} borderColor="#a78bfa" gradientFrom="#a78bfa" gradientTo="#22d3ee" label="// AI Engine Status" icon={Cpu}>
        <div className="flex items-center gap-2 mt-1">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping" style={{ background: '#4ade80' }} />
            <span className="relative inline-flex h-3 w-3 rounded-full" style={{ background: '#4ade80' }} />
          </span>
          <p className="mono text-base font-extrabold" style={{ color: '#a78bfa', textShadow: '0 0 12px rgba(167,139,250,0.5)' }}>
            [ ONLINE ]
          </p>
        </div>
        <p className="mono text-xs mt-2" style={{ color: '#a78bfa' }}>AEGIS-LLAMA3-8B-QUANTIZED</p>
        <p className="mono text-xs mt-1" style={{ color: '#475569' }}>HEURISTIC EXPERT SYSTEM ACTIVE</p>
      </Card>

      {/* Active DB Pool */}
      <Card index={3} borderColor="#fbbf24" gradientFrom="#fbbf24" gradientTo="#f97316" label="// Active DB Pool" icon={HardDrive}>
        <p className="mono text-sm font-bold" style={{ color: '#fbbf24', textShadow: '0 0 10px rgba(251,191,36,0.4)' }}>SQLITE FTS5</p>
        <p className="mono text-xs mt-1" style={{ color: '#f97316' }}>IN-MEMORY CACHE LAYER</p>
        <div className="flex items-end gap-1 mt-3">
          {[0.9, 0.6, 0.85, 0.5, 0.75, 0.65, 0.9].map((h, i) => (
            <motion.div
              key={i}
              className="w-2 rounded-sm"
              style={{ background: '#fbbf24', opacity: h }}
              initial={{ height: 0 }}
              animate={{ height: h * 24 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.8, delay: 0.3 + i * 0.06 }}
            />
          ))}
          <span className="mono text-xs ml-2" style={{ color: '#64748b' }}>HEALTHY</span>
        </div>
      </Card>

      {/* Threat Mix */}
      <Card index={4} borderColor="#f87171" gradientFrom="#f87171" gradientTo="#f97316" label="// Threat Mix" icon={AlertTriangle}>
        <div className="space-y-2">
          <div className="flex justify-between mono text-xs">
            <span style={{ color: '#f87171' }}>CRITICAL/ERR</span>
            <span className="font-bold" style={{ color: '#f87171' }}>{criticals}</span>
          </div>
          <div className="flex justify-between mono text-xs">
            <span style={{ color: '#fbbf24' }}>WARNING</span>
            <span className="font-bold" style={{ color: '#fbbf24' }}>{warnings}</span>
          </div>
          <div className="flex justify-between mono text-xs">
            <span style={{ color: '#22d3ee' }}>INFO</span>
            <span className="font-bold" style={{ color: '#22d3ee' }}>{infos}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
