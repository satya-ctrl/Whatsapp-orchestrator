import React, { useEffect, useState } from 'react';

export default function LokiTimeSlip({ onComplete }) {
  const [phase, setPhase] = useState('start');

  useEffect(() => {
    // Stage 1: Screen darkens, central orb glows
    setTimeout(() => setPhase('gather'), 50);
    // Stage 2: Rays rush in from all sides (timeline branches)
    setTimeout(() => setPhase('bind'), 600);
    // Stage 3: Intense flash/swoosh to white/green
    setTimeout(() => setPhase('swoosh'), 1600);
    // Stage 4: Trigger route change
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);
  }, [onComplete]);

  // Generate random timeline branches
  const branches = Array.from({ length: 80 }).map((_, i) => {
    const angle = Math.random() * 360;
    const length = 50 + Math.random() * 100;
    const delay = Math.random() * 0.4;
    const thickness = 1 + Math.random() * 4;
    return { angle, length, delay, thickness, id: i };
  });

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-all duration-700 ${phase === 'start' ? 'bg-transparent backdrop-blur-none' : 'bg-[#070b0a]/95 backdrop-blur-3xl'}`}>
      
      {/* Intense Swoosh Flash */}
      <div 
        className={`absolute inset-0 bg-[#5ed29c] mix-blend-screen transition-opacity duration-300 ${phase === 'swoosh' ? 'opacity-100' : 'opacity-0'}`} 
      />
      <div 
        className={`absolute inset-0 bg-white transition-opacity duration-500 delay-100 ${phase === 'swoosh' ? 'opacity-100' : 'opacity-0'}`} 
      />

      <div className={`relative transition-transform duration-[800ms] ease-in-out ${phase === 'swoosh' ? 'scale-[80] opacity-0' : 'scale-100'}`}>
        
        {/* Core Yggdrasil Glow */}
        <div className={`absolute -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#5ed29c] blur-[100px] transition-all duration-1000 ${phase === 'gather' || phase === 'bind' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />

        {/* Twisting Branches / Rays */}
        {branches.map((b) => (
          <div
            key={b.id}
            className="absolute top-0 left-0 origin-left"
            style={{
              transform: `rotate(${b.angle}deg)`,
              width: `${b.length}vw`,
            }}
          >
            <div 
              className={`w-full rounded-full bg-gradient-to-r from-white via-[#5ed29c] to-transparent shadow-[0_0_20px_#5ed29c] transition-all duration-[900ms] ease-out`}
              style={{
                height: `${b.thickness}px`,
                transitionDelay: `${b.delay}s`,
                transform: phase === 'start' || phase === 'gather' ? 'translateX(100vw) scaleX(3)' : 'translateX(0) scaleX(1)',
                opacity: phase === 'bind' ? 1 : 0
              }}
            />
          </div>
        ))}

        {/* Center Black Hole / Anchor */}
        <div className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-[0_0_80px_30px_#5ed29c] transition-all duration-1000 ${phase === 'bind' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
      </div>
    </div>
  );
}
