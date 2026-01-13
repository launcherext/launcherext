"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, LayoutGrid, ExternalLink as LinkIcon } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Higher z-index */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] md:hidden"
            style={{ zIndex: 100 }}
          />

          {/* Menu Panel - Even higher z-index with solid background */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[280px] md:hidden flex flex-col"
            style={{ 
              zIndex: 200,
              backgroundColor: '#000000',
              borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10" style={{ backgroundColor: '#000000' }}>
              <span className="text-sm font-medium text-gray-400">Menu</span>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2" style={{ backgroundColor: '#000000' }}>
              <MobileMenuLink
                href="/whitepaper"
                icon={<FileText className="w-5 h-5" />}
                label="Whitepaper"
                onClick={onClose}
              />
              <MobileMenuLink
                href="/docs"
                icon={<LinkIcon className="w-5 h-5" />}
                label="Docs"
                onClick={onClose}
              />
              <MobileMenuLink
                href="/gallery"
                icon={<LayoutGrid className="w-5 h-5" />}
                label="Gallery"
                onClick={onClose}
              />
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10" style={{ backgroundColor: '#000000' }}>
              <p className="text-xs text-gray-600 text-center">
                DexDrip · Banner Generator
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface MobileMenuLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function MobileMenuLink({ href, icon, label, onClick }: MobileMenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-lg",
        "text-gray-300 hover:text-white",
        "hover:bg-white/10",
        "transition-colors duration-150",
        "min-h-[48px]"
      )}
    >
      <span className="flex-shrink-0 text-accent">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
