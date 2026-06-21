import React, { useEffect, useState } from 'react';

export default function ThunderStrike({ onComplete }) {
  const [phase, setPhase] = useState('charging');

  useEffect(() => {
    // Phase 1: Charging (darkness, slight rumble)
    const t1 = setTimeout(() => setPhase('strike'), 400);
    
    // Phase 2: The Strike (flash, shake, bolt)
    const t2 = setTimeout(() => setPhase('explosion'), 600);
    
    // Phase 3: The Explosion (screen goes white)
    const t3 = setTimeout(() => setPhase('fade-out'), 1200);
    
    // Phase 4: Complete transition
    const t4 = setTimeout(() => onComplete(), 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-[999999] pointer-events-none flex items-center justify-center overflow-hidden"
      style={{
        animation: phase === 'strike' || phase === 'explosion' ? 'thunder-shake 0.3s infinite cubic-bezier(.36,.07,.19,.97) both' : 'none',
      }}
    >
      <style>{`
        @keyframes thunder-shake {
          0%, 100% { transform: translate3d(0, 0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate3d(-8px, -8px, 0); }
          20%, 40%, 60%, 80% { transform: translate3d(8px, 8px, 0); }
        }
        @keyframes thunder-flash {
          0% { opacity: 0; }
          10% { opacity: 1; }
          20% { opacity: 0.2; }
          30% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes strike-down {
          0% { transform: scaleY(0); transform-origin: top; opacity: 0; }
          50% { transform: scaleY(1); opacity: 1; }
          100% { transform: scaleY(1); opacity: 0; }
        }
        @keyframes explosion-expand {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(100); opacity: 0; }
        }
      `}</style>

      {/* Background Darkening */}
      <div 
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ opacity: phase === 'charging' ? 0.7 : phase === 'strike' ? 0.2 : phase === 'explosion' ? 0 : 0 }}
      />

      {/* Sky Flash */}
      {(phase === 'strike' || phase === 'explosion') && (
        <div 
          className="absolute inset-0 bg-[#e0f7fa] mix-blend-screen"
          style={{ animation: 'thunder-flash 0.5s ease-out forwards' }}
        />
      )}

      {/* The Lightning Web */}
      {phase === 'strike' && (
        <svg 
          className="absolute inset-0 w-full h-full drop-shadow-[0_0_30px_#00e5ff]"
          style={{ animation: 'strike-down 0.2s ease-out forwards' }}
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <g stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 8px #00e5ff)' }}>
            {/* Main Central Bolt */}
            <path d="M50,0 L48,10 L52,22 L46,35 L53,48 L47,60 L52,75 L48,88 L50,100" strokeWidth="1.5" />
            
            {/* Major Left Branches */}
            <path d="M48,10 L38,15 L32,25 L20,30 L10,45 L0,55" strokeWidth="1" />
            <path d="M46,35 L35,42 L28,55 L15,65 L5,80" strokeWidth="0.8" />
            <path d="M47,60 L35,65 L25,75 L15,90" strokeWidth="0.6" />

            {/* Major Right Branches */}
            <path d="M52,22 L62,28 L68,40 L80,45 L90,60 L100,70" strokeWidth="1" />
            <path d="M53,48 L65,55 L72,70 L85,80 L95,95" strokeWidth="0.8" />
            <path d="M52,75 L62,82 L75,88 L90,100" strokeWidth="0.6" />

            {/* Minor Sub-branches */}
            <path d="M38,15 L30,10 L20,0" strokeWidth="0.4" />
            <path d="M68,40 L75,32 L85,25 L95,15" strokeWidth="0.5" />
            <path d="M35,42 L25,35 L15,25" strokeWidth="0.4" />
            <path d="M65,55 L75,50 L85,40" strokeWidth="0.4" />
            <path d="M28,55 L18,50 L5,45" strokeWidth="0.3" />
            <path d="M72,70 L80,65 L95,60" strokeWidth="0.3" />
          </g>
        </svg>
      )}

      {/* The Impact Explosion */}
      {(phase === 'strike' || phase === 'explosion') && (
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full mix-blend-screen"
          style={{ 
            animation: 'explosion-expand 0.8s cubic-bezier(0.1, 1, 0.2, 1) forwards',
            boxShadow: '0 0 100px 50px rgba(0, 229, 255, 1)'
          }}
        />
      )}

      {/* Final Whiteout */}
      <div 
        className="absolute inset-0 bg-white transition-opacity duration-300"
        style={{ opacity: phase === 'fade-out' ? 1 : 0 }}
      />
    </div>
  );
}
