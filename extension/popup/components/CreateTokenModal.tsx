import React, { useEffect } from 'react';

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const CreateTokenModal: React.FC<CreateTokenModalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with glassmorphism */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slideUp">
        <div
          className="bg-[#050505]/95 backdrop-blur-2xl border-t border-brand-green/30 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,255,136,0.1)] relative overflow-hidden"
          style={{
            height: '88vh',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-20 bg-brand-green/10 blur-[60px] pointer-events-none"></div>

          {/* Drag Handle */}
          <div className="flex justify-center pt-4 pb-3 relative z-10">
            <div className="w-16 h-1 bg-white/10 rounded-full" />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 text-gray-400 hover:text-white border border-white/5 hover:border-white/20 active:scale-95 z-20"
            aria-label="Close"
          >
            <span className="text-sm font-bold">✕</span>
          </button>

          {/* Modal Content */}
          <div className="px-8 pb-8 h-full overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateTokenModal;
