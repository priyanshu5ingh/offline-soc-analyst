import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, Crosshair, FileText, Loader2 } from 'lucide-react';

export default function SearchBar({
  onSearch,
  onFreshCapture,
  onGenerateReport,
  isSyncing,
  isCapturing,
  isReporting,
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.15, duration: 0.7, delay: 0.2 }}
      className="glass-strong mb-6"
      style={{ padding: '24px 32px' }}
    >
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <p className="mono text-xs font-bold uppercase tracking-[0.15em]" style={{ color: '#6366f1' }}>
            // Query Interface
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight" style={{ color: '#e2e8f0' }}>
            Advanced FTS5 Search Engine
          </h2>
        </div>
        <div className="mono text-xs px-4 py-2 rounded-lg" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8' }}>
          {'>'} SELECT * FROM logs {query ? `WHERE message MATCH '${query}'` : ''} LIMIT 200
        </div>
      </div>

      {/* Search + Buttons Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="flex items-center gap-3 flex-1 rounded-xl px-4 py-3"
          style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.15)' }}
        >
          <Search size={16} style={{ color: '#6366f1', flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={handleInput}
            placeholder="Search — try: Error, Kernel, Security, metasploit..."
            className="w-full bg-transparent text-sm font-medium outline-none mono"
            style={{ color: '#e2e8f0', caretColor: '#6366f1' }}
          />
          {query && (
            <button onClick={clearSearch} className="text-lg leading-none shrink-0" style={{ color: '#64748b' }}>✕</button>
          )}
        </div>

        {/* Severity Filter */}
        <select
          value={filter}
          onChange={handleFilter}
          className="mono text-xs font-bold rounded-xl px-4 py-3 outline-none cursor-pointer"
          style={{
            background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.15)',
            color: '#818cf8', minWidth: 140,
          }}
        >
          <option value="">ALL SEVERITY</option>
          <option value="Critical">CRITICAL</option>
          <option value="Error">ERROR</option>
          <option value="Warning">WARNING</option>
          <option value="Information">INFO</option>
        </select>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Fresh Capture */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onFreshCapture}
            disabled={isCapturing}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shrink-0 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #be123c, #f43f5e, #be123c)',
              backgroundSize: '200% auto',
              boxShadow: '0 0 15px rgba(239,68,68,0.4), 0 4px 16px rgba(239,68,68,0.2)',
            }}
          >
            {isCapturing ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
            <span>{isCapturing ? 'Purging…' : 'Fresh Capture'}</span>
          </motion.button>

          {/* Generate Report */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGenerateReport}
            disabled={isReporting}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shrink-0 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7, #7c3aed)',
              backgroundSize: '200% auto',
              boxShadow: '0 0 15px rgba(168,85,247,0.4), 0 4px 16px rgba(168,85,247,0.2)',
            }}
          >
            {isReporting ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            <span>{isReporting ? 'Building…' : 'AI PDF Report'}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
