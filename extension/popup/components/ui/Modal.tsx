import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-center animate-fadeIn pt-[100px] px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#050505]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content - Fixed position relative to top to ensure visibility below header */}
      <div className="relative w-full max-w-md mx-auto glass-panel rounded-2xl overflow-hidden animate-scaleUp z-[110] shadow-2xl flex flex-col max-h-[500px]">
        
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-20 bg-brand-green/10 blur-[50px] pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/5 relative z-10 shrink-0">
          <h2 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-5 relative z-10 overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-5 border-t border-white/5 bg-white/5 relative z-10 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
