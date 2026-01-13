"use client";

import { useState, ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, Twitter, Menu } from "lucide-react";
import Link from "next/link";
import { MobileMenu } from "./MobileMenu";

interface HeaderProps {
  actions?: ReactNode;
}

/**
 * Header - Top navigation bar
 * 
 * Obsidian Minimal design:
 * - Clean, simple, no visual clutter
 * - Logo on left, actions on right
 * - Subtle border bottom
 */
export function Header({ actions }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer"
          >
            <div className="relative w-6 h-6 sm:w-8 sm:h-8">
              <Image 
                src="/mainlogo.svg" 
                alt="DexDrip Logo" 
                fill
              />
            </div>
            <div className="relative group">
              <span className="text-xl sm:text-2xl font-drip text-foreground pt-1 relative z-10">
                DexDrip
              </span>
              {/* Drips */}
              <span className="absolute left-2 bottom-1 w-1 h-3 bg-accent rounded-full animate-drip" style={{ animationDelay: '0s' }} />
              <span className="absolute left-8 bottom-0 w-1.5 h-4 bg-accent rounded-full animate-drip" style={{ animationDelay: '1.2s' }} />
              <span className="absolute right-4 bottom-1 w-1 h-2.5 bg-accent rounded-full animate-drip" style={{ animationDelay: '2.5s' }} />
            </div>
          </motion.div>
          
          <span className="text-gray-600 text-xs sm:text-sm hidden md:inline">
            Banner Generator
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Hamburger Menu Button - Mobile Only */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-1 sm:gap-2">
            {actions}
          </div>

          {/* Mobile Actions (wallet button only) */}
          <div className="md:hidden">
            {actions}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}

/**
 * HeaderButton - Consistent button style for header actions
 */
interface HeaderButtonProps {
  icon: ReactNode;
  label?: string;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'primary';
}



export function HeaderButton({ icon, label, onClick, href, variant = 'default' }: HeaderButtonProps) {
  const baseClasses = "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2 rounded-lg text-sm font-medium transition-all duration-150 min-h-[36px] sm:min-h-[44px]";
  const variantClasses = variant === 'primary' 
    ? "bg-accent text-black hover:bg-accent-hover"
    : "text-gray-400 hover:text-foreground hover:bg-gray-900";

  const content = (
    <>
      <span className="flex-shrink-0">{icon}</span>
      {label && <span className="hidden sm:inline text-xs sm:text-sm">{label}</span>}
    </>
  );

  if (href) {
    if (href.startsWith('/')) {
      return (
        <Link
          href={href}
          className={`${baseClasses} ${variantClasses}`}
        >
          {content}
        </Link>
      );
    }
    
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${variantClasses}`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      {content}
    </button>
  );
}
