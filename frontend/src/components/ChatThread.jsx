import React, { useEffect, useRef } from 'react';
import TypingIndicator from './TypingIndicator';

const STATUS_STYLE = {
  WAITING_FOR_BOT:  { bg: 'bg-wa-green/10',   text: 'text-wa-green',      border: 'border-wa-green/20',   label: 'Active' },
  AGENT_RESPONDING: { bg: 'bg-meta-blue/10',   text: 'text-meta-blue-light',border: 'border-meta-blue/20', label: 'Bot Responding' },
  NEEDS_HUMAN:      { bg: 'bg-red-500/10',     text: 'text-red-400',       border: 'border-red-500/20',    label: '⚠ Needs Human' },
  RESOLVED:         { bg: 'bg-white/5',        text: 'text-white/40',      border: 'border-white/10',      label: 'Resolved' },
};

function parseDate(ts) {
  if (!ts) return new Date();
  return new Date(ts.endsWith('Z') ? ts : `${ts}Z`);
}

function formatTime(ts) {
  if (!ts) return '';
  return parseDate(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function DateSeparator({ timestamp }) {
  const d = parseDate(timestamp);
  const today = new Date();
  let label;
  if (d.toDateString() === today.toDateString()) label = 'Today';
  else {
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    label = d.toDateString() === yesterday.toDateString()
      ? 'Yesterday'
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  return (
    <div className="flex items-center justify-center py-3">
      <span className="text-[11px] text-white/30 bg-white/5 border border-white/8 px-3 py-1 rounded-full font-medium">
        {label}
      </span>
    </div>
  );
}

export default function ChatThread({ messages, conversation, isTyping }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 sm:px-8"
        style={{ background: 'radial-gradient(ellipse at center, rgba(37,211,102,0.03) 0%, transparent 70%)' }}
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white/40 mb-1">Select a conversation</p>
          <p className="text-xs text-white/20">Choose a contact from the list to view the thread</p>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLE[conversation.status] || STATUS_STYLE.WAITING_FOR_BOT;

  return (
    <div className="flex flex-col h-full">

      {/* Thread Header */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0 gap-2"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">
            {conversation.customer_phone?.replace(/\D/g, '').slice(-2)}
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-white truncate">{conversation.customer_phone}</p>
            <p className="text-[10px] sm:text-[11px] text-white/35 truncate">
              Started {parseDate(conversation.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold border whitespace-nowrap flex-shrink-0 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
          {statusStyle.label}
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-5 py-3 sm:py-4 space-y-0.5"
        style={{
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.015'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"), transparent`,
        }}
      >
        {messages.map((msg, idx) => {
          const isUser = msg.direction === 'inbound';
          const showSep = idx === 0 || (
            parseDate(msg.timestamp).toDateString() !== parseDate(messages[idx - 1]?.timestamp).toDateString()
          );
          const showTime = idx === 0 || (
            parseDate(msg.timestamp).getTime() - parseDate(messages[idx - 1]?.timestamp).getTime() > 300000
          );

          return (
            <React.Fragment key={msg.message_id || idx}>
              {showSep && <DateSeparator timestamp={msg.timestamp} />}
              {!showSep && showTime && (
                <div className="flex justify-center py-2">
                  <span className="text-[10px] text-white/25">{formatTime(msg.timestamp)}</span>
                </div>
              )}

              <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1 animate-fade-in`}>
                {/* Bot avatar */}
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-wa-green to-wa-green-dark flex items-center justify-center flex-shrink-0 mr-2 mt-1 self-end shadow-green-glow">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                )}

                <div className={isUser ? 'bubble-user' : 'bubble-bot'}>
                  {/* Text */}
                  {msg.text && (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  )}

                  {/* Image */}
                  {msg.message_type === 'image' && msg.media && (
                    <div className="mt-1.5 rounded-xl overflow-hidden">
                      <img
                        src={msg.media.url}
                        alt="Shared image"
                        className="w-full max-w-[220px] h-auto object-cover"
                        loading="lazy"
                      />
                      <div className="mt-1.5">
                        <span className="media-badge media-badge-image">📷 Image</span>
                      </div>
                    </div>
                  )}

                  {/* Document */}
                  {msg.message_type === 'document' && msg.media && (
                    <div className="mt-1.5">
                      <div className="bg-black/20 border border-white/10 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-black/30 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-red-400 text-sm">📄</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {msg.media.filename || 'Document.pdf'}
                          </p>
                          <p className="text-[10px] text-white/40 mt-0.5">PDF • Tap to download</p>
                        </div>
                      </div>
                      <div className="mt-1.5">
                        <span className="media-badge media-badge-pdf">📄 PDF</span>
                      </div>
                    </div>
                  )}

                  {/* Timestamp + read receipts */}
                  <div className={`flex items-center gap-1 mt-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-white/30">{formatTime(msg.timestamp)}</span>
                    {!isUser && <span className="text-[10px] text-wa-green/60">✓✓</span>}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {isTyping && (
          <div className="flex justify-start mb-2 animate-fade-in">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-wa-green to-wa-green-dark flex items-center justify-center mr-2 mt-1 self-end">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <TypingIndicator />
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
