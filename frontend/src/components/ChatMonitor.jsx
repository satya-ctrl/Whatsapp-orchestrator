import React from 'react';
import ContactList from './ContactList';
import ChatThread from './ChatThread';

export default function ChatMonitor({
  conversations, activeConversation, messages,
  conversationData, isTyping, onSelectConversation,
}) {
  return (
    <div
      className="glass-panel overflow-hidden flex h-full"
      style={{ borderRadius: '32px' }}
    >
      {/* Left — Contacts */}
      <div className="w-[320px] flex-shrink-0 flex flex-col border-r border-white/5">
        <ContactList
          conversations={conversations}
          activeConversation={activeConversation}
          onSelect={onSelectConversation}
        />
      </div>

      {/* Right — Chat Thread */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        <ChatThread
          messages={messages}
          conversation={conversationData}
          isTyping={isTyping}
        />
      </div>
    </div>
  );
}
