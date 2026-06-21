import React from 'react';
import ContactList from './ContactList';
import ChatThread from './ChatThread';
import { ArrowLeft } from 'lucide-react';

export default function ChatMonitor({
  conversations, activeConversation, messages,
  conversationData, isTyping, onSelectConversation, onMobileBack,
}) {
  return (
    <div
      className="glass-panel overflow-hidden flex h-full relative"
      style={{ borderRadius: '20px', smBorderRadius: '32px' }}
    >
      {/* Left — Contacts (always visible on desktop, visible on mobile when no active conversation) */}
      <div className={`
        w-full sm:w-[320px] flex-shrink-0 flex flex-col border-r-0 sm:border-r border-white/5
        ${activeConversation ? 'hidden sm:flex' : 'flex'}
      `}>
        <ContactList
          conversations={conversations}
          activeConversation={activeConversation}
          onSelect={onSelectConversation}
        />
      </div>

      {/* Right — Chat Thread (always visible on desktop, visible on mobile only when conversation is active) */}
      <div className={`
        flex-1 flex flex-col min-w-0 bg-transparent
        ${activeConversation ? 'flex' : 'hidden sm:flex'}
      `}>
        {/* Mobile back button — only visible on small screens when a conversation is active */}
        {activeConversation && onMobileBack && (
          <div className="sm:hidden flex-shrink-0 px-3 pt-3 pb-1">
            <button
              onClick={onMobileBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white/70 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
            >
              <ArrowLeft size={14} />
              Conversations
            </button>
          </div>
        )}
        <ChatThread
          messages={messages}
          conversation={conversationData}
          isTyping={isTyping}
        />
      </div>
    </div>
  );
}
