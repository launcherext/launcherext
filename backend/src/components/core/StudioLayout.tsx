"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StudioLayoutProps {
  controlPanel: ReactNode;
  viewport: ReactNode;
  topNav?: ReactNode;
}

export function StudioLayout({ controlPanel, viewport, topNav }: StudioLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-deep flex flex-col lg:flex-row overflow-clip relative">
      {/* TOP RIGHT NAVIGATION */}
      {topNav && (
        <div className="fixed top-0 right-0 z-50 p-4 md:p-6">
          {topNav}
        </div>
      )}

      {/* LEFT PANEL: Control Deck (Scrollable) */}
      <div className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0 flex flex-col border-r border-white/5 bg-bg-panel/50 backdrop-blur-sm relative z-20 lg:h-screen">
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
           <div className="p-6 lg:p-8 space-y-8">
             {controlPanel}
           </div>
        </div>
        
        {/* Footer Fade / Shadow */}
        <div className="h-12 bg-gradient-to-t from-bg-deep to-transparent pointer-events-none absolute bottom-0 left-0 w-full z-10" />
      </div>

      {/* RIGHT PANEL: Viewport (Fixed & Centered) */}
      <div className="flex-1 lg:fixed lg:right-0 lg:top-0 lg:h-screen lg:w-[calc(100%-450px)] xl:w-[calc(100%-500px)] bg-black/40 flex flex-col relative overflow-hidden">
        {/* Background Grid / Effects specific to viewport */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] pointer-events-none" />
        
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
           {viewport}
        </div>
      </div>
    </div>
  );
}
