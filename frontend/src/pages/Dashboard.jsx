import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import ChatMonitor from '../components/ChatMonitor';
import BroadcastDrawer from '../components/BroadcastDrawer';
import HlsVideoBackground from '../components/HlsVideoBackground';
import { fetchTenants, fetchConversations, fetchMessages } from '../utils/api';
import { ArrowLeft, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="glass-panel-dense px-4 py-3 flex items-center gap-3 rounded-xl">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-white/40 leading-none mb-0.5">{label}</p>
        <p className="text-lg font-bold text-white leading-none">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard({ onBackToHome }) {
  const [tenants, setTenants]             = useState([]);
  const [activeTenant, setActiveTenant]   = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages]           = useState([]);
  const [conversationData, setConversationData] = useState(null);
  const [isBroadcastOpen, setIsBroadcastOpen]   = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await fetchTenants();
      if (data?.length > 0) { setTenants(data); setActiveTenant(data[0].tenant_id); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!activeTenant) return;
    setActiveConversation(null); setMessages([]); setConversationData(null);
    const load = async () => { const data = await fetchConversations(activeTenant); setConversations(data || []); };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [activeTenant]);

  const loadMessages = useCallback(async () => {
    if (!activeConversation) return;
    const data = await fetchMessages(activeConversation);
    if (data) { setMessages(data.messages || []); setConversationData(data.conversation || null); }
  }, [activeConversation]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const isTyping = conversationData?.status === 'AGENT_RESPONDING';

  // Stats
  const total      = conversations.length;
  const active     = conversations.filter(c => c.status === 'WAITING_FOR_BOT' || c.status === 'AGENT_RESPONDING').length;
  const escalated  = conversations.filter(c => c.status === 'NEEDS_HUMAN').length;
  const resolved   = conversations.filter(c => c.status === 'RESOLVED').length;

  return (
    <div className="relative min-h-screen bg-[#080c10] text-white overflow-x-hidden">
      {/* Background — matching HomePage HLS video */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <HlsVideoBackground />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b0a] via-[#070b0a]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b0a] via-[#070b0a]/50 to-transparent" />
        <div 
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] md:w-[900px] h-[300px] rounded-[100%] bg-[#5ed29c]/15"
          style={{ filter: 'blur(30px)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto pt-6 px-4 pb-6 flex flex-col h-screen">

        {/* Back Button */}
        <div className="w-[95%] mx-auto mb-3">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold tracking-wider text-white transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <ArrowLeft size={14} />
            BACK
          </button>
        </div>

        <Header
          tenants={tenants}
          activeTenant={activeTenant}
          onTenantChange={setActiveTenant}
          onBroadcastClick={() => setIsBroadcastOpen(true)}
          onBackToHome={onBackToHome}
        />

        {/* Stats bar */}
        <div className="w-[95%] mx-auto mb-4 flex items-center gap-3">
          <StatCard
            icon={<MessageSquare size={14} className="text-white/60" />}
            label="Total" value={total}
            color="bg-white/5"
          />
          <StatCard
            icon={<span className="w-2 h-2 rounded-full bg-wa-green animate-pulse-dot block" />}
            label="Active" value={active}
            color="bg-wa-green/10"
          />
          {escalated > 0 && (
            <StatCard
              icon={<AlertTriangle size={14} className="text-red-400" />}
              label="Escalated" value={escalated}
              color="bg-red-500/10"
            />
          )}
          <StatCard
            icon={<CheckCircle2 size={14} className="text-meta-blue" />}
            label="Resolved" value={resolved}
            color="bg-meta-blue/10"
          />
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/3 border border-white/6">
            <span className="w-1.5 h-1.5 rounded-full bg-wa-green animate-pulse" />
            <span className="text-[11px] text-white/40 font-medium">Live</span>
          </div>
        </div>

        <main className="flex-1 w-[95%] mx-auto pb-2 min-h-0 relative z-0">
          <ChatMonitor
            conversations={conversations}
            activeConversation={activeConversation}
            messages={messages}
            conversationData={conversationData}
            isTyping={isTyping}
            onSelectConversation={setActiveConversation}
          />
        </main>
      </div>

      <BroadcastDrawer
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        tenantId={activeTenant}
      />
    </div>
  );
}
