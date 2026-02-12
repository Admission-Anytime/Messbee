import React, { useState } from 'react';
import { XMarkIcon, RocketLaunchIcon } from '@heroicons/react/24/solid'; // Ensure you have heroicons installed, or remove icons

const FirstHeader = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 border-b border-yellow-500/50 py-2 px-3 relative z-40 transition-all duration-300 ease-in-out">
      
      {/* Container to center content but allow absolute positioning for Close button */}
      <div className="max-w-[1600px] mx-auto flex items-center justify-center relative">

        {/* --- Content --- */}
        <div className="flex items-center gap-2 text-center pr-8 sm:pr-0">
           {/* Icon - Hidden on mobile to save space, visible on tablet+ */}
           <RocketLaunchIcon className="w-4 h-4 text-amber-900 hidden sm:block animate-pulse" />
           
           <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-900 tracking-wide leading-tight">
              Welcome to MessBee – A powerful WhatsApp Business platform.
              {/* Link */}
              <a 
                href='#' 
                className="ml-1 sm:ml-2 underline decoration-black/20 underline-offset-2 hover:text-black hover:decoration-black/60 transition-all font-bold"
              >
                Grow your Business <span className="hidden sm:inline">&rarr;</span>
              </a>
           </p>
        </div>

        {/* --- Close Button (Absolute Right) --- */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-black/10 text-slate-800 transition-colors"
          aria-label="Dismiss"
        >
          <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

      </div>
    </div>
  );
}

export default FirstHeader;