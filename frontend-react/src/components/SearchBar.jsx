import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Crosshair, FileText, Loader2 } from 'lucide-react';

export default function SearchBar({
  onSearch, onFreshCapture, onGenerateReport,
  isSyncing, isCapturing, isReporting,
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val, filter);
  };

  const handleFilter = (e) => {
    const val = e.target.value;
    setFilter(val);
    onSearch(query, val);
  };

  const clearSearch = () => {
    setQuery('');
    setFilter('');
    onSearch('', '');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.12, duration: 0.8, delay: 0.25 }}
      className="glass-strong mb-8 overflow-hidden"
      style={{ padding: 0 }}
    >
      <div style={{ padding: '24px 32px' }}>
        {/* Section Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div>
            <p className="mono text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#4f46e5' }}>
              // Query Interface
            </p>
            <h2 className="mt-1.5 text-xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>
              Advanced FTS5 Search Engine
            </h2>
          </div>
          <div className="mono text-[11px] px-4 py-2 rounded-xl" style={{
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid #e2e8f0',
            color: '#475569',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
          }}>
            <span style={{ color: '#4f46e5' }}>{'>'}</span> SELECT * FROM logs {query ? `WHERE message MATCH '${query}'` : ''} LIMIT 200
          </div>
        </div>

        {/* Search + Buttons Row */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search Input */}
          <div className="flex items-center gap-3 flex-1 rounded-xl px-5 py-3.5 bg-white" style={{
            border: '1px solid #cbd5e1',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.02)',
          }}>
            <Search size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={handleInput}
              placeholder="Search — try: Error, Kernel, Security, metasploit..."
              className="w-full bg-transparent text-sm font-semibold outline-none"
              style={{ color: '#334155', caretColor: '#4f46e5', fontFamily: "'JetBrains Mono', monospace" }}
            />
            {query && (
              <button onClick={clearSearch} className="text-base shrink-0 transition-colors" style={{ color: '#94a3b8' }}>✕</button>
            )}
          </div>

          {/* Severity Filter */}
          <select
            value={filter}
            onChange={handleFilter}
            className="mono text-[11px] font-bold rounded-xl px-5 py-3.5 outline-none cursor-pointer bg-white"
            style={{
              border: '1px solid #cbd5e1',
              color: '#475569',
              minWidth: 150,
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.02)',
              WebkitAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
              paddingRight: 36,
            }}
          >
            <option value="">ALL SEVERITY</option>
            <option value="Critical">CRITICAL</option>
            <option value="Error">ERROR</option>
            <option value="Warning">WARNING</option>
            <option value="Information">INFO</option>
          </select>

          {/* Action Buttons */}
          <div className="flex gap-2.5 flex-wrap">
            {/* Fresh Capture */}
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onFreshCapture}
              disabled={isCapturing}
              className="shrink-0 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 px-5 py-3.5 rounded-xl text-white shadow-md"
              style={{
                background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                boxShadow: '0 4px 14px 0 rgba(225, 29, 72, 0.39)',
              }}
            >
              {isCapturing ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
              <span className="font-bold text-[13px]">{isCapturing ? 'Purging…' : 'Fresh Capture'}</span>
            </motion.button>

            {/* Generate Report */}
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onGenerateReport}
              disabled={isReporting}
              className="shrink-0 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 px-5 py-3.5 rounded-xl text-white shadow-md"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.39)',
              }}
            >
              {isReporting ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              <span className="font-bold text-[13px]">{isReporting ? 'Building…' : 'AI PDF Report'}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
