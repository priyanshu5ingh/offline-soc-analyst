import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';

import Header from './components/Header';
import TelemetryCards from './components/TelemetryCards';
import SearchBar from './components/SearchBar';
import EventTable from './components/EventTable';
import PdfReportTemplate from './components/PdfReportTemplate';

import {
  fetchLogs as apiFetchLogs,
  forceSync as apiSync,
  freshCapture as apiCapture,
  getExecutiveSummary,
} from './api';

// ── Toast Component ──────────────────────────────────────────────────────
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.9 }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-strong flex items-center gap-3 px-6 py-3.5 rounded-xl"
      style={{ border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 0 30px rgba(99,102,241,0.15)' }}
    >
      <span className="mono text-sm font-semibold" style={{ color: '#e2e8f0' }}>{message}</span>
      <button onClick={onClose} className="text-lg" style={{ color: '#64748b' }}>✕</button>
    </motion.div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────
export default function App() {
  // ── State ──────────────────────────────────────────────────────────────
  const [logs, setLogs]           = useState([]);
  const [status, setStatus]       = useState('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [toast, setToast]         = useState(null);
  const [pdfData, setPdfData]     = useState(null);
  const [telemetry, setTelemetry] = useState({
    total: 0, latency: 0, criticals: 0, warnings: 0, infos: 0,
  });

  const searchTimerRef = useRef(null);

  // ── Fetch Logs ─────────────────────────────────────────────────────────
  const loadLogs = useCallback(async (query = '', severity = '') => {
    setIsLoading(true);
    const t0 = performance.now();
    try {
      const data = await apiFetchLogs(query, severity);
      const logList = data.logs || data || [];
      setLogs(logList);
      setStatus('online');

      const elapsed = Math.round(performance.now() - t0);
      const total = data.total || logList.length;
      const crits = logList.filter(l => ['critical','error'].includes((l.severity||'').toLowerCase())).length;
      const warns = logList.filter(l => ['warning','warn'].includes((l.severity||'').toLowerCase())).length;
      const infos = Math.max(0, logList.length - crits - warns);

      setTelemetry({ total, latency: elapsed, criticals: crits, warnings: warns, infos });
    } catch (err) {
      console.error('Fetch logs error:', err);
      setStatus('offline');
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Initial Load ───────────────────────────────────────────────────────
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // ── Search (debounced) ─────────────────────────────────────────────────
  const handleSearch = useCallback((query, severity) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => loadLogs(query, severity), 300);
  }, [loadLogs]);

  // ── Force Sync ─────────────────────────────────────────────────────────
  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await apiSync();
      await loadLogs();
      setToast('⚡ Telemetry sync complete.');
    } catch (err) {
      setToast('Sync failed. Ensure backend is running.');
    } finally {
      setIsSyncing(false);
    }
  }, [loadLogs]);

  // ── Fresh Capture ──────────────────────────────────────────────────────
  const handleFreshCapture = useCallback(async () => {
    setIsCapturing(true);
    try {
      const result = await apiCapture();
      setToast(`✅ ${result.message}`);
      await loadLogs();
    } catch (err) {
      setToast('Fresh capture failed. Ensure backend is running.');
    } finally {
      setIsCapturing(false);
    }
  }, [loadLogs]);

  // ── Generate PDF Report ────────────────────────────────────────────────
  const handleGenerateReport = useCallback(async () => {
    setIsReporting(true);
    try {
      const data = await getExecutiveSummary();
      setPdfData(data);

      // Wait for the template to render in the DOM
      await new Promise(r => setTimeout(r, 200));

      const el = document.getElementById('pdf-report-template');
      if (!el) throw new Error('PDF template not found');

      const now = new Date();
      const opt = {
        margin:      [0, 0, 0, 0],
        filename:    `AEGIS_Threat_Report_${now.toISOString().slice(0, 10)}.pdf`,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF:       { unit: 'px', format: 'a4', orientation: 'portrait', hotfixes: ['px_scaling'] },
      };

      await html2pdf().set(opt).from(el).save();
      setToast('📄 Executive PDF report downloaded.');
    } catch (err) {
      console.error('Report generation failed:', err);
      setToast('Report generation failed. Ensure backend is running.');
    } finally {
      setIsReporting(false);
    }
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Background Orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="grid-overlay" />

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto w-full max-w-[1440px] px-6 py-8 sm:px-8 lg:px-10"
      >
        <Header status={status} />
        <TelemetryCards telemetry={telemetry} />

        <SearchBar
          onSearch={handleSearch}
          onFreshCapture={handleFreshCapture}
          onGenerateReport={handleGenerateReport}
          isSyncing={isSyncing}
          isCapturing={isCapturing}
          isReporting={isReporting}
        />

        <EventTable
          logs={logs}
          totalCount={telemetry.total}
          isLoading={isLoading}
        />
      </motion.main>

      {/* Hidden PDF Report Template */}
      <PdfReportTemplate data={pdfData} />

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </>
  );
}
