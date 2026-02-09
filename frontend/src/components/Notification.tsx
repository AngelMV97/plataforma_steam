'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  duration?: number;
  onClose?: () => void;
}

export function Notification({ 
  message, 
  type = 'error', 
  duration = 5000,
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          bgColor: 'bg-[#F3E8E8] dark:bg-[#3D2424]',
          borderColor: 'border-[#E8696B]',
          iconColor: 'text-[#C53D40]',
          textColor: 'text-[#5D2326]',
          closeColor: 'hover:bg-[#E8696B]/20'
        };
      case 'success':
        return {
          bgColor: 'bg-[#E8F5F3] dark:bg-[#243D3B]',
          borderColor: 'border-[#4A9B98]',
          iconColor: 'text-[#2F6F6D]',
          textColor: 'text-[#1F3A5F]',
          closeColor: 'hover:bg-[#4A9B98]/20'
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-[#EEF4F8] dark:bg-[#24333D]',
          borderColor: 'border-[#5B8FB9]',
          iconColor: 'text-[#1F3A5F]',
          textColor: 'text-[#1F3A5F]',
          closeColor: 'hover:bg-[#5B8FB9]/20'
        };
    }
  };

  const styles = getStyles();
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div
        className={`${styles.bgColor} border-2 ${styles.borderColor} rounded-lg p-4 flex gap-3 items-start shadow-lg`}
      >
        <Icon className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} strokeWidth={2} />
        <p className={`${styles.textColor} text-sm font-medium flex-1 break-words`}>
          {message}
        </p>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className={`flex-shrink-0 p-1 rounded ${styles.closeColor} transition-colors`}
        >
          <X className={`w-4 h-4 ${styles.iconColor}`} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
