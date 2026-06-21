import React, { useState } from 'react';
import { Search, AlertTriangle } from 'lucide-react';

const STATUS_CONFIG = {
  AGENT_RESPONDING: { dotClass: 'status-responding', label: 'Bot typing…', textClass: 'text-meta-blue-light' },
  NEEDS_HUMAN:      { dotClass: 'status-needs-human', label: 'Needs human',  textClass: 'text-red-400' },
  RESOLVED:         { dotClass: 'status-resolved',    label: 'Resolved',     textClass: 'text-white/30' },
  WAITING_FOR_BOT:  { dotClass: 'status-active',      label: 'Active',       textClass: 'text-wa-green' },
};

function getStatus(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.WAITING_FOR_BOT;
}

function formatTime(ts) {
  if (!ts) return '';
  const d   = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000)    return 'just now';
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getInitials(phone) {
  return phone?.replace(/\D/g, '').slice(-2) || '??';
}

const AVATAR_COLORS = [
  ['#25D366','#128C7E'],
  ['#3b82f6','#2563eb'],
  ['#f59e0b','#d97706'],
  ['#8b5cf6','#7c3aed'],
  ['#ec4899','#db2777'],
];

function getAvatarColor(phone) {
  const n = phone?.replace(/\D/g, '').slice(-1);
  return AVATAR_COLORS[parseInt(n || '0') % AVATAR_COLORS.length];
}

export default function ContactList({ conversations, activeConversation, onSelect }) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c =>
    c.customer_phone?.toLowerCase().includes(search.toLowerCase()) ||
    c.last_message?.text?.toLowerCase().includes(search.toLowerCase())
  );

  const escalatedCount = conversations.filter(c => c.status === 'NEEDS_HUMAN').length;

  return (
    <div className="flex flex-col h-full bg-black/20">

      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      {/* Header row */}
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-white/25">
          {filtered.length} Conversation{filtered.length !== 1 ? 's' : ''}
        </span>
        {escalatedCount > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertTriangle size={10} className="text-red-400" />
            <span className="text-[10px] font-bold text-red-400">{escalatedCount} escalated</span>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-1">
        {filtered.map((conv) => {
          const status   = getStatus(conv.status);
          const isActive = activeConversation === conv.conversation_id;
          const isEsc    = conv.status === 'NEEDS_HUMAN';
          const [c1, c2] = isEsc
            ? ['#f87171', '#ef4444']
            : getAvatarColor(conv.customer_phone);

          return (
            <div
              key={conv.conversation_id}
              id={`contact-${conv.conversation_id}`}
              onClick={() => onSelect(conv.conversation_id)}
              className={`contact-item px-3 py-3 mb-0.5 ${isActive ? 'active' : ''}`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                  >
                    {getInitials(conv.customer_phone)}
                  </div>
                  <div
                    className={`status-dot absolute -bottom-0.5 -right-0.5 ${status.dotClass}`}
                    style={{ width: 10, height: 10, border: '2px solid transparent' }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-semibold text-white/90 truncate">
                      {conv.customer_phone}
                    </p>
                    <span className="text-[10px] text-white/25 flex-shrink-0 ml-2">
                      {formatTime(conv.updated_at)}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 truncate leading-relaxed">
                    {conv.last_message?.direction === 'outbound' && (
                      <span className="text-white/25">Bot: </span>
                    )}
                    {conv.last_message?.text || 'No messages yet'}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className={`status-dot ${status.dotClass}`} style={{ width: 6, height: 6 }} />
                    <span className={`text-[10px] font-medium ${status.textClass}`}>
                      {status.label}
                    </span>
                    {conv.last_message?.message_type === 'image'    && <span className="text-[10px]">📷</span>}
                    {conv.last_message?.message_type === 'document' && <span className="text-[10px]">📄</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Search size={22} className="text-white/20" />
            </div>
            <p className="text-sm text-white/30 text-center">
              {search ? 'No results found' : 'No conversations yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
