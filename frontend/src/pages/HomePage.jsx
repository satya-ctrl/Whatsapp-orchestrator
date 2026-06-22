import { useState } from 'react';
import { Shield, Zap, Users, BarChart3, ArrowRight, Menu, X } from 'lucide-react';
import HlsVideoBackground from '../components/HlsVideoBackground';
import Logo from '../components/Logo';

const FEATURES = [
  {
    icon: <Zap size={20} className="text-[#5ed29c]" />,
    title: 'LangGraph AI Engine',
    desc: 'Multi-step reasoning pipelines with tool calling and memory for rich, contextual replies.',
  },
  {
    icon: <Users size={20} className="text-[#5ed29c]" />,
    title: 'Multi-Tenant SaaS',
    desc: 'Serve multiple brands from a single platform — each with its own AI persona and knowledge base.',
  },
  {
    icon: <BarChart3 size={20} className="text-[#5ed29c]" />,
    title: 'Live Monitoring',
    desc: 'Real-time conversation dashboard with escalation alerts and human handoff support.',
  },
  {
    icon: <Shield size={20} className="text-[#5ed29c]" />,
    title: 'HMAC-SHA256 Security',
    desc: 'Every webhook is validated with cryptographic signatures to prevent spoofed requests.',
  },
];

const NAV_ITEMS = [
  { label: 'API DOCS', href: '/docs' },
  { label: 'ABOUT', action: 'about' },
];

export default function HomePage({ onEnterDashboard }) {
  const [isPopped, setIsPopped] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070b0a] text-white overflow-x-hidden relative flex flex-col cursor-default select-none font-['Inter']">
      
      {/* ── HIGH-END BACKGROUND SYSTEM ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* HLS Video Stream */}
        <HlsVideoBackground />

        {/* Dark Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b0a] via-[#070b0a]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b0a] via-transparent to-transparent" />

        {/* Central Glow (Cyan/Dark Green) */}
        <div 
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] md:w-[900px] h-[200px] sm:h-[300px] rounded-[100%] bg-[#5ed29c]/20"
          style={{ filter: 'blur(25px)' }}
        />
      </div>

      {/* Screen Flash Overlay on Headline Click */}
      <div 
        className={`fixed inset-0 z-10 pointer-events-none transition-colors duration-200 ease-out ${
          isPopped ? 'bg-[#5ed29c]/30 mix-blend-screen' : 'bg-transparent'
        }`}
      />

      <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between">
        {/* Left Logo */}
        <div className="flex items-center gap-2 sm:gap-3 select-none">
          <Logo className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform" />
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
            WhatsApp Orchestrator
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-1 bg-[#070b0a]/50 backdrop-blur-md border border-white/10 rounded-full px-2 py-1.5">
          {NAV_ITEMS.map((item) => (
            <a 
              key={item.label} 
              href={item.href || '#'} 
              target={item.href ? "_blank" : undefined} 
              rel={item.href ? "noreferrer" : undefined}
              onClick={(e) => {
                if (item.action === 'about') {
                  e.preventDefault();
                  setIsAboutOpen(true);
                }
              }}
              className="h-8 px-4 flex items-center text-[12px] font-semibold tracking-widest text-white/80 hover:text-[#5ed29c] rounded-full transition-all duration-200 cursor-pointer">
              {item.label}
            </a>
          ))}
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80 active:scale-95 transition-transform"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed top-[64px] left-4 right-4 z-50 bg-[#0d1117]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 animate-fade-in sm:hidden">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href || '#'}
              target={item.href ? "_blank" : undefined}
              rel={item.href ? "noreferrer" : undefined}
              onClick={(e) => {
                setMobileMenuOpen(false);
                if (item.action === 'about') {
                  e.preventDefault();
                  setIsAboutOpen(true);
                }
              }}
              className="block px-4 py-3 text-[13px] font-semibold tracking-widest text-white/80 hover:text-[#5ed29c] hover:bg-white/5 rounded-xl transition-all duration-200 cursor-pointer"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}

      {/* Main Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-[14vh] sm:pt-[12vh]">
        <div className="animate-fade-in flex flex-col items-center gap-2 max-w-4xl mx-auto">
          
          <div className="origin-center flex flex-col items-center relative z-20">
            {/* Eyebrow */}
            <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[11px] sm:text-[13px] text-[#5ed29c] uppercase tracking-widest mb-3 sm:mb-4">
              AI-Powered Automation
            </h2>

            {/* Main Headline */}
            <h1 
              onClick={() => {
                setIsPopped(true);
                setTimeout(() => setIsPopped(false), 300);
              }}
              className={`font-black leading-[0.85] tracking-tighter uppercase cursor-pointer select-none transition-all duration-200 ease-out origin-center ${
                isPopped 
                  ? 'scale-110 drop-shadow-[0_0_100px_rgba(94,210,156,0.8)] text-white' 
                  : 'scale-100 hover:scale-[1.02] drop-shadow-2xl text-white'
              }`} 
              style={{ fontSize: 'clamp(42px, 12vw, 170px)', textShadow: isPopped ? '0 20px 50px rgba(0,0,0,0.8)' : 'none' }}
            >
              WhatsApp<br />Orchestrator<span className="text-[#5ed29c]">.</span>
            </h1>
          </div>

          {/* Sub Description */}
          <p className="max-w-[512px] text-[13px] sm:text-[14px] leading-relaxed text-white/70 font-normal mt-4 sm:mt-6 mb-6 sm:mb-8 px-2">
            Master intelligent multi-tenant automation. Deploy autonomous AI agents, rich media, and broadcast campaigns — all connected to a single high-end orchestration platform.
          </p>

          <div className="flex items-center gap-4 mt-2">
            {/* Primary CTA */}
            <button
              onClick={onEnterDashboard}
              className="group flex items-center justify-center gap-2 sm:gap-3 rounded-full px-6 sm:px-8 py-3.5 sm:py-4 text-[13px] sm:text-[14px] font-bold tracking-wide uppercase transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
              style={{ background: '#5ed29c', color: '#070b0a', boxShadow: '0 0 30px rgba(94,210,156,0.2)' }}
            >
              Launch Dashboard
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* Feature Cards Grid */}
        <div className="w-full max-w-5xl mx-auto mt-[10vh] sm:mt-[15vh] md:mt-[25vh] pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {FEATURES.map((f) => (
            <div key={f.title}
              className="liquid-glass-card p-5 sm:p-6 flex flex-col gap-3 hover:border-white/20 transition-all duration-200 group text-left cursor-pointer active:bg-[#5ed29c] active:bg-opacity-60 shadow-[0_0_30px_rgba(94,210,156,0.1)] hover:shadow-[0_0_40px_rgba(94,210,156,0.3)]"
              style={{ borderRadius: '16px' }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#5ed29c]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-active:bg-white/20">
                {f.icon}
              </div>
              <h3 className="font-semibold text-[15px] sm:text-[16px] text-white group-active:text-white">{f.title}</h3>
              <p className="text-[13px] text-white/60 leading-relaxed group-active:text-white/90">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
      {/* About Architecture Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsAboutOpen(false)}
          />
          <div className="relative w-full max-w-3xl bg-[#0d1117] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl animate-fade-in overflow-hidden">
            <button 
              onClick={() => setIsAboutOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-2">Architecture Flow</h2>
            <p className="text-white/60 mb-6 text-sm">How the Multi-Tenant Agentic Orchestrator processes messages using LangGraph.</p>
            
            <div className="bg-[#070b0a] rounded-xl p-4 sm:p-6 border border-white/5 font-mono text-[10px] sm:text-[12px] md:text-[14px] text-[#5ed29c] whitespace-pre overflow-x-auto">
              {`       [WhatsApp Webhook Inbound]  
                   │ 
                   ▼ 
       ┌───────────────────────────────────────┐ 
       │   Acknowledge Node    │ ───► (Send Read & Typing On WhatsApp) 
       └───────────────────────────────────────┘ 
                   │ 
                   ▼ 
       ┌───────────────────────────────────────┐ 
       │ Context Retriever Node│ ───► (Pull tenant rules & history) 
       └───────────────────────────────────────┘ 
                   │ 
                   ▼ 
       ┌───────────────────────────────────────┐ 
       │  LLM Reasoning Node   │ ───► (Choose response type & assets) 
       └───────────────────────────────────────┘ 
                   │ 
                   ▼ 
       ┌───────────────────────────────────────┐ 
       │    Dispatcher Node    │ ───► (Send Text/Image/Doc & Save State) 
       └───────────────────────────────────────┘ `}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setIsAboutOpen(false)}
                className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
