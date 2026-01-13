"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AppShellProps {
  sidebar: ReactNode;
  main: ReactNode;
  header?: ReactNode;
}

/**
 * AppShell - Main application layout
 * 
 * Obsidian Minimal design:
 * - Fixed sidebar on left (controls)
 * - Main content area on right (preview)
 * - Optional header for nav/branding
 */
export function AppShell({ sidebar, main, header }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
          {header}
        </header>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar - Controls */}
        <aside className="w-full lg:w-[420px] xl:w-[480px] flex-shrink-0 border-r border-border bg-background overflow-y-auto lg:h-[calc(100vh-65px)] lg:sticky lg:top-[65px]">
          <div className="custom-scrollbar h-full">
            {sidebar}
          </div>
        </aside>

        {/* Main Content - Preview */}
        <main className="flex-1 min-h-[60vh] lg:min-h-0 bg-background relative overflow-hidden">
          
          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center p-6 lg:p-12">
            {main}
          </div>
        </main>
      </div>
    </div>
  );
}
