import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Logo from './Logo';
import LokiTimeSlip from './LokiTimeSlip';

const TENANT_COLORS = {
  'tenant-a-luxury-furniture': { from: '#f59e0b', to: '#d97706', glow: 'rgba(245,158,11,0.4)' },
  'tenant-b-automotive-care':  { from: '#3b82f6', to: '#2563eb', glow: 'rgba(59,130,246,0.4)' },
};

function getTenantColor(id) {
  return TENANT_COLORS[id] || { from: '#6366f1', to: '#4f46e5', glow: 'rgba(99,102,241,0.4)' };
}

export default function Header({ tenants, activeTenant, onTenantChange, onBroadcastClick, onBackToHome }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isTimeSlipping, setIsTimeSlipping] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !e.target.closest('#portal-dropdown')) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleDropdownToggle = () => {
    if (dropdownRef.current && !dropdownOpen) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      setDropdownCoords({
        top: rect.bottom + 8,
        left: isMobile ? 12 : rect.left,
      });
    }
    setDropdownOpen(!dropdownOpen);
  };

  const activeTenantData = tenants.find(t => t.tenant_id === activeTenant);
  const activeColor      = getTenantColor(activeTenant);

  return (
    <>
      {isTimeSlipping && <LokiTimeSlip onComplete={onBackToHome} />}
      <header className="relative w-full sm:w-[95%] mx-auto z-50 mb-3 sm:mb-5">
      <div className="glass-panel px-3 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between rounded-2xl gap-2">

        {/* ── Tenant Switcher ── */}
        <div className="relative z-[9999] min-w-0 flex-shrink" ref={dropdownRef}>
          <button
            onClick={handleDropdownToggle}
            id="tenant-switcher"
            className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl transition-all duration-200 hover:bg-white/5 group min-w-0"
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${activeColor.from}, ${activeColor.to})`,
                boxShadow: `0 0 12px ${activeColor.glow}`,
              }}
            >
              {activeTenantData?.name?.charAt(0) || '?'}
            </div>
            <div className="text-left min-w-0 hidden xs:block sm:block">
              <p className="text-xs sm:text-sm font-semibold text-white leading-tight truncate">
                {activeTenantData?.name || 'Select Tenant'}
              </p>
              <p className="text-[10px] text-white/40 leading-tight">Active Workspace</p>
            </div>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              className={`text-white/40 transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown via Portal */}
          {dropdownOpen && createPortal(
            <div 
              id="portal-dropdown"
              className="fixed w-[calc(100vw-24px)] sm:w-72 glass-panel p-2 animate-fade-in z-[999999] rounded-xl"
              style={{ top: dropdownCoords.top, left: dropdownCoords.left }}
            >
              <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                Switch Workspace
              </p>
              {tenants.map((tenant) => {
                const color   = getTenantColor(tenant.tenant_id);
                const isActive = tenant.tenant_id === activeTenant;
                return (
                  <button
                    key={tenant.tenant_id}
                    onClick={() => { onTenantChange(tenant.tenant_id); setDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-150"
                    style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.8)'
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
                    >
                      {tenant.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.9)' }}>
                        {tenant.name}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {tenant.tenant_id}
                      </p>
                    </div>
                    {isActive && (
                      <svg width="14" height="14" fill="none" stroke="#25D366" viewBox="0 0 24 24" className="flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>,
            document.body
          )}
        </div>

        {/* Center logo — hidden on mobile to save space */}
        <div 
          id="header-logo" 
          onClick={() => setIsTimeSlipping(true)}
          className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-3 select-none cursor-pointer group"
        >
          <Logo className="w-10 h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-300" />
          <div className="flex flex-col justify-center">
            <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap group-hover:text-[#5ed29c] transition-colors duration-300 leading-none">
              WhatsApp Orchestrator
            </span>
            <span className="text-[9px] text-[#5ed29c]/40 font-bold tracking-[0.2em] uppercase mt-1 group-hover:text-[#5ed29c]/80 transition-colors duration-300">
              Loki Effect
            </span>
          </div>
        </div>

        {/* ── Broadcast Button ── */}
        <button
          id="broadcast-trigger"
          onClick={onBroadcastClick}
          className="group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm text-white transition-all duration-300 overflow-hidden flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(0,132,255,0.2), rgba(0,96,204,0.2))',
            border: '1px solid rgba(0,132,255,0.3)',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,132,255,0.3)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <span className="tracking-wide text-[12px] sm:text-[13px] hidden xs:inline sm:inline">Broadcast</span>
          <span className="tracking-wide text-[12px] sm:text-[13px] xs:hidden sm:hidden">📢</span>
        </button>
      </div>
    </header>
    </>
  );
}
