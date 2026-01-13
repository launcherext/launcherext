"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket } from "lucide-react";

interface ActivityEvent {
  type: string;
  text: string;
  createdAt: string;
  id: string;
  link?: string;
}

export function StatsTicker() {
  const [activeEvent, setActiveEvent] = useState<ActivityEvent | null>(null);
  
  useEffect(() => {
    // Poll for local activity
    const poll = async () => {
      try {
        const res = await fetch('/api/activity');
        const data = await res.json();
        if (data.success && data.events.length > 0) {
          // Pick a random recent event to display "live" feel
          const randomEvent = data.events[Math.floor(Math.random() * Math.min(data.events.length, 3))];
          setActiveEvent(randomEvent);
        }
      } catch (e) {
        // ignore
      }
    };

    poll(); // Initial
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-8 bg-black border-b border-white/5 flex items-center justify-center overflow-hidden relative">
      <div className="flex items-center gap-6 text-xs font-mono text-gray-500">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className="relative">
             <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </div>
          <span className="text-gray-400 hidden sm:inline">DexDrip Activity</span>
          <span className="text-gray-400 sm:hidden">Live</span>
        </div>

        {/* Divider */}
        <div className="w-px h-3 bg-white/10" />

        {/* Live Feed */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <AnimatePresence mode="wait">
            {activeEvent ? (
              <motion.span
                key={activeEvent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-gray-300 truncate flex items-center gap-2"
              >
                <Rocket className="w-3 h-3 text-accent" />
                <span className="text-gray-300">{activeEvent.text}</span>
                {activeEvent.link && (
                    <a 
                        href={activeEvent.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="ml-2 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-gray-400 transition-colors"
                    >
                        View ↗
                    </a>
                )}
              </motion.span>
            ) : (
                <span className="text-gray-600 italic">Waiting for activity...</span>
            )}
          </AnimatePresence>
        </div>
      </div>
          
      {/* Decorative gradient fade on sides */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-black to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-black to-transparent pointer-events-none" />
    </div>
  );
}
