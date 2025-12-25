import React from "react";

export default function Logo({ className = "w-8 h-8", textClassName = "text-xl" }) {
  // If className contains a background color, do not apply default 'bg-black text-white'
  const hasBg = className.includes("bg-");
  const defaultColors = hasBg ? "" : "bg-black text-white";

  return (
    <div className="flex items-center gap-2 select-none group">
      <div className={`relative flex items-center justify-center rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300 ${defaultColors} ${className}`}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-2/3 h-2/3"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
      <span className={`font-black tracking-tighter text-gray-900 group-hover:text-black transition-colors ${textClassName}`}>
        Eventix
      </span>
    </div>
  );
}
