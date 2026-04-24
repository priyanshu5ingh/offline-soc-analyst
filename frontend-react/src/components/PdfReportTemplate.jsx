import { useRef } from 'react';

// ── PDF Report Template (rendered off-screen, captured by html2pdf) ──────
export default function PdfReportTemplate({ data }) {
  if (!data) return null;

  const bannerColors = {
    CRITICAL: { bg: '#7f1d1d', border: '#ef4444', labelColor: '#fca5a5', text: '#fca5a5' },
    HIGH:     { bg: '#7c2d12', border: '#f97316', labelColor: '#fdba74', text: '#fdba74' },
    MEDIUM:   { bg: '#713f12', border: '#eab308', labelColor: '#fde68a', text: '#fde68a' },
    LOW:      { bg: '#14532d', border: '#22c55e', labelColor: '#86efac', text: '#86efac' },
  };
  const bc = bannerColors[data.risk_level] || bannerColors.LOW;
  const now = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'medium' });

  return (
    <div
      id="pdf-report-template"
      style={{
        position: 'absolute', left: -9999, top: 0, width: 794,
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        background: '#fff', color: '#1e293b',
      }}
    >
      {/* Cover Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', padding: '40px 48px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#818cf8', textTransform: 'uppercase', margin: 0 }}>
              AEGIS — Offline Cyber Defense Console
            </p>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>
              Executive Threat Intelligence Report
            </h1>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>Classification: <strong style={{ color: '#94a3b8' }}>CONFIDENTIAL</strong></span>
          <span style={{ fontSize: 11, color: '#64748b' }}>Generated: <strong style={{ color: '#94a3b8' }}>{now}</strong></span>
          <span style={{ fontSize: 11, color: '#64748b' }}>Model: <strong style={{ color: '#94a3b8' }}>AEGIS-Llama3-8B-Quantized</strong></span>
        </div>
      </div>

      {/* Risk Banner */}
      <div style={{ padding: '14px 48px', background: bc.bg, borderBottom: `2px solid ${bc.border}` }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: bc.labelColor, textTransform: 'uppercase' }}>
          Overall Risk Level:{' '}
        </span>
        <span style={{ fontSize: 14, fontWeight: 800, color: bc.text }}>{data.risk_level}</span>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        {[
          { label: 'Total Events', value: data.total_events, color: '#1e293b' },
          { label: 'Critical / Error', value: data.critical_count, color: '#dc2626' },
          { label: 'Warnings', value: data.warning_count, color: '#d97706' },
          { label: 'Informational', value: data.info_count, color: '#0369a1' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#f8fafc', padding: '20px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>{label}</p>
            <p style={{ fontSize: 32, fontWeight: 800, color, margin: '6px 0 0' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* AI Summary */}
      <div style={{ padding: '32px 48px' }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: '#6366f1', textTransform: 'uppercase', margin: '0 0 10px' }}>
          // AI Threat Analysis
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: '#334155', margin: 0 }}>{data.summary}</p>
      </div>

      <div style={{ height: 1, background: '#e2e8f0', margin: '0 48px' }} />

      {/* Recommendation */}
      <div style={{ padding: '32px 48px' }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: '#7c3aed', textTransform: 'uppercase', margin: '0 0 10px' }}>
          // Recommended IR Action
        </p>
        <div style={{ background: '#faf5ff', borderLeft: '4px solid #7c3aed', borderRadius: '0 8px 8px 0', padding: '16px 20px' }}>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: '#3b0764', margin: 0 }}>{data.recommendation}</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#f1f5f9', borderTop: '1px solid #e2e8f0', padding: '16px 48px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>AEGIS SOC Analyst — Air-gapped Forensic Platform</span>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>CONFIDENTIAL — NOT FOR DISTRIBUTION</span>
      </div>
    </div>
  );
}
