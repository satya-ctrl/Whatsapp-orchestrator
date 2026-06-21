import React, { useState } from 'react';
import { sendBroadcast } from '../utils/api';

const TEMPLATES = [
  { value: 'new_catalog_promo',    label: 'New Catalog Promo',    desc: 'Send latest catalog PDF to customers' },
  { value: 'seasonal_sale',        label: 'Seasonal Sale Alert',  desc: 'Notify about upcoming sale events' },
  { value: 'appointment_reminder', label: 'Appointment Reminder', desc: 'Remind customers of upcoming visits' },
  { value: 'hello_world',          label: 'Hello World (Test)',   desc: 'Test message for verification' },
];

const COHORTS = [
  { value: 'all_active', label: 'All Active Contacts', sub: 'Customers active in last 30 days' },
  { value: 'resolved',   label: 'Resolved Only',       sub: 'Customers with resolved queries' },
];

/* ── Inline SVG icons (no external dependency issues) ── */
const IconClose = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconMegaphone = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
  </svg>
);
const IconSend = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);
const IconSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    style={{ animation: 'spin 1s linear infinite' }}>
    <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
    <path fill="currentColor" className="opacity-75"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default function BroadcastDrawer({ isOpen, onClose, tenantId }) {
  const [template,     setTemplate]     = useState('new_catalog_promo');
  const [cohort,       setCohort]       = useState('all_active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result,       setResult]       = useState(null);

  if (!isOpen) return null;

  const handleBroadcast = async () => {
    setIsSubmitting(true); setResult(null);
    const mockNumbers = ['+15550001111', '+15550002222'];
    try {
      const res = await sendBroadcast(tenantId, {
        template_name: template, phone_numbers: mockNumbers, language_code: 'en_US',
      });
      setResult({ success: true, data: res || { sent: mockNumbers.length } });
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTemplate = TEMPLATES.find(t => t.value === template);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Drawer — flex column, full height, footer always at bottom */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 420,
          background: 'linear-gradient(180deg, #0d1117 0%, #0a1014 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '-24px 0 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* ── Header (fixed height) ── */}
        <div
          className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#4DA3FF]"
              style={{ background: 'rgba(0,132,255,0.12)', border: '1px solid rgba(0,132,255,0.25)' }}
            >
              <IconMegaphone />
            </div>
            <div>
              <h2 className="font-bold text-base text-white leading-tight">Broadcast Campaign</h2>
              <p className="text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Send to your customer segments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-white/50 hover:text-white hover:bg-white/8"
            title="Close"
          >
            <IconClose />
          </button>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-5">

          {/* Template */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Message Template
            </p>
            <div className="space-y-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTemplate(t.value)}
                  className="w-full text-left p-3.5 rounded-xl flex items-center gap-3 transition-all duration-200"
                  style={{
                    background: template === t.value ? 'rgba(0,132,255,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${template === t.value ? 'rgba(0,132,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  {/* Radio dot */}
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      border: `2px solid ${template === t.value ? '#0084FF' : 'rgba(255,255,255,0.25)'}`,
                      background: template === t.value ? '#0084FF' : 'transparent',
                    }}
                  >
                    {template === t.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cohort */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Target Cohort
            </p>
            <div className="space-y-2">
              {COHORTS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCohort(c.value)}
                  className="w-full text-left p-3.5 rounded-xl flex items-center gap-3 transition-all duration-200"
                  style={{
                    background: cohort === c.value ? 'rgba(37,211,102,0.07)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${cohort === c.value ? 'rgba(37,211,102,0.25)' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      border: `2px solid ${cohort === c.value ? '#25D366' : 'rgba(255,255,255,0.25)'}`,
                      background: cohort === c.value ? '#25D366' : 'transparent',
                    }}
                  >
                    {cohort === c.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.label}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{c.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Preview
            </p>
            <div className="p-4 rounded-xl" style={{ background: '#111b21', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {selectedTemplate?.label}
              </p>
              <div className="inline-block rounded-2xl rounded-tl-sm px-4 py-3 max-w-[280px]" style={{ background: '#202c33' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Hi there! 👋 Check out our latest collection. Tap the document below.
                </p>
                <div className="mt-2.5 rounded-xl p-3 flex items-center gap-2"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.2)' }}>
                    <span className="text-xs">📄</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Catalog.pdf</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>PDF Document</p>
                  </div>
                </div>
                <p className="text-[10px] text-right mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Now ✓✓</p>
              </div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div
              className="p-4 rounded-xl flex items-start gap-3"
              style={{
                background: result.success ? 'rgba(37,211,102,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${result.success ? 'rgba(37,211,102,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}
            >
              <span className="text-lg leading-none flex-shrink-0">{result.success ? '✅' : '❌'}</span>
              <p className="text-sm" style={{ color: result.success ? '#25D366' : '#f87171' }}>
                {result.success
                  ? `Broadcast launched! Sent to ${result.data?.sent || 2} contacts.`
                  : `Failed: ${result.error}`}
              </p>
            </div>
          )}
        </div>

        {/* ── Footer CTA (always visible, outside scroll) ── */}
        <div
          className="flex-shrink-0 px-6 py-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <button
            onClick={handleBroadcast}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #0084FF, #0060CC)',
              boxShadow: isSubmitting ? 'none' : '0 4px 24px rgba(0,132,255,0.45)',
            }}
          >
            {isSubmitting
              ? <><IconSpinner /> Launching…</>
              : <><IconSend /> Launch Broadcast</>
            }
          </button>
          <p className="text-center text-[11px] mt-2.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
            Templates must be pre-approved by Meta
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
