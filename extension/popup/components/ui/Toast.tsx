import React, { useEffect } from 'react';
import clsx from 'clsx';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  const colors = {
    success: 'bg-success/20 border-success text-success',
    error: 'bg-error/20 border-error text-error',
    info: 'bg-accent-green/20 border-accent-green text-accent-green',
  };

  return (
    <div className={clsx(
      'fixed bottom-6 right-6 z-50',
      'px-6 py-4 rounded-lg border-2',
      'flex items-center gap-3',
      'animate-scaleIn',
      colors[type]
    )}>
      <span className="text-2xl">{icons[type]}</span>
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
