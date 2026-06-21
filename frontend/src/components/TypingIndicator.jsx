import React from 'react';

/**
 * TypingIndicator — Authentic WhatsApp-style three-dot bounce animation.
 */
export default function TypingIndicator() {
  return (
    <div className="bubble-bot flex items-center gap-1 px-4 py-3" style={{ minWidth: 56 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block w-2 h-2 rounded-full bg-white/40"
          style={{
            animation: `bounce-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
