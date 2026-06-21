import React from 'react';

/**
 * DataFlowAnimation — Continuous glowing gradient lines on left & right margins
 * Simulates constant data flow and orchestration activity.
 */
export default function DataFlowAnimation() {
  return (
    <>
      {/* Left margin flow lines */}
      <div className="data-flow-line animate-data-flow" style={{ left: '16px', top: '-120px' }} />
      <div className="data-flow-line animate-data-flow-delay" style={{ left: '16px', top: '-120px' }} />

      {/* Right margin flow lines */}
      <div className="data-flow-line animate-data-flow" style={{ right: '16px', top: '-120px' }} />
      <div className="data-flow-line animate-data-flow-delay" style={{ right: '16px', top: '-120px' }} />

      {/* Background gradient glows */}
      <div className="bg-glow-green" style={{ top: '-200px', left: '-100px' }} />
      <div className="bg-glow-blue" style={{ top: '30%', right: '-150px' }} />
      <div className="bg-glow-green" style={{ bottom: '-100px', right: '20%', opacity: 0.7 }} />
      <div className="bg-glow-blue" style={{ bottom: '10%', left: '10%', opacity: 0.5 }} />
    </>
  );
}
