import React from 'react';

export default function Logo({ className = "w-9 h-9" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield Background - Black */}
      <path 
        d="M 5 15 L 50 5 L 95 15 L 95 80 L 50 115 L 5 80 Z" 
        fill="#000000" 
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      
      {/* W */}
      <path 
        d="M 15 25 H 25 V 50 L 32.5 42 L 40 50 V 25 H 50 V 62 L 32.5 50 L 15 62 Z" 
        fill="#ffffff" 
      />
      
      {/* O */}
      <path 
        d="M 58 25 H 85 V 62 H 58 Z M 67 35 V 52 H 76 V 35 Z" 
        fill="#ffffff" 
        fillRule="evenodd"
      />

      {/* Subtle Horizontal line separator */}
      <rect x="15" y="70" width="70" height="1" fill="#ffffff" opacity="0.2" />

      {/* Star */}
      <path 
        d="M 50 75 L 54 87 H 67 L 56 95 L 60 107 L 50 99 L 40 107 L 44 95 L 33 87 H 46 Z" 
        fill="#ffffff" 
      />
    </svg>
  );
}
