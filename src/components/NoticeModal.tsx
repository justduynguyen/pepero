'use client';

import { useState, useEffect } from 'react';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain?: () => void;
  showDontShowAgain?: boolean;
  title?: string;
  message: string | React.ReactNode;
  icon?: string;
}

export default function NoticeModal({
  isOpen,
  onClose,
  onDontShowAgain,
  showDontShowAgain = false,
  title = '📢 Thông báo',
  message,
  icon = '🔔',
}: NoticeModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Lock scroll body
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleDontShowAgain = () => {
    if (onDontShowAgain) {
      onDontShowAgain();
    }
    handleClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center p-3 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        // --- CÁC THAY ĐỔI QUAN TRỌNG ĐỂ FIX OVERFLOW ---
        // 1. max-h-[90vh]: Giới hạn chiều cao không quá 90% màn hình
        // 2. flex flex-col: Để chia layout Header - Content (scroll) - Footer
        className={`bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all duration-300 flex flex-col max-h-[80vh] ${
          isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Cố định */}
        <div className="px-6 py-4 border-b border-gray-100 bg-rose-50/30 flex items-center justify-between shrink-0 rounded-t-2xl">
          <h2 className="font-bold text-lg text-rose-600 flex items-center gap-2">
            {title}
          </h2>
          <button 
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content - Cho phép cuộn dọc */}
        <div className="p-6 overflow-y-auto">
          <div className="flex flex-col gap-4">
            <div className="text-gray-600 text-center leading-relaxed text-sm sm:text-base">
              {message}
            </div>
          </div>
        </div>

        {/* Footer - Cố định ở đáy */}
        <div className="p-6 pt-4 border-t border-gray-50 bg-white flex flex-col gap-3 shrink-0 rounded-b-2xl">
          <button
            onClick={handleClose}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-rose-200 transition-all"
          >
            OKIEE, Đã hiểu!
          </button>
          
          {showDontShowAgain && (
            <button
              onClick={handleDontShowAgain}
              className="w-full text-xs sm:text-sm text-gray-400 hover:text-rose-500 font-medium transition-colors py-1"
            >
              Đừng hiện thông báo này nữa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}