'use client';

import { Lightbulb, X } from 'lucide-react';

interface HintModalProps {
  isOpen: boolean;
  hint: string;
  hintLevel?: 'light' | 'medium' | 'strong';
  onClose: () => void;
}

export function HintModal({ isOpen, hint, hintLevel = 'light', onClose }: HintModalProps) {
  if (!isOpen) return null;

  const getHintIcon = () => {
    switch (hintLevel) {
      case 'light':
        return '💡';
      case 'medium':
        return '🔍';
      case 'strong':
        return '📚';
      default:
        return '💡';
    }
  };

  const getHintColor = () => {
    switch (hintLevel) {
      case 'light':
        return 'border-[#5B8FB9] bg-[#EEF4F8] dark:bg-[#24333D]';
      case 'medium':
        return 'border-[#2F6F6D] bg-[#E8F5F3] dark:bg-[#243D3B]';
      case 'strong':
        return 'border-[#1F3A5F] bg-[#F3E8E8] dark:bg-[#3D2424]';
      default:
        return 'border-[#5B8FB9] bg-[#EEF4F8] dark:bg-[#24333D]';
    }
  };

  const getTextColor = () => {
    switch (hintLevel) {
      case 'light':
        return 'text-[#1F3A5F] dark:text-[#F3F4F6]';
      case 'medium':
        return 'text-[#1F3A5F] dark:text-[#F3F4F6]';
      case 'strong':
        return 'text-[#5D2326] dark:text-[#F3F4F6]';
      default:
        return 'text-[#1F3A5F] dark:text-[#F3F4F6]';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 transition-opacity"
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-11/12 max-w-lg">
        <div className={`${getHintColor()} border-2 rounded-lg shadow-2xl p-6 space-y-4`}>
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getHintIcon()}</span>
              <h3 className={`text-lg font-bold ${getTextColor()}`}>
                {hintLevel === 'light'
                  ? 'Pista de Orientación'
                  : hintLevel === 'medium'
                  ? 'Guía de Camino'
                  : 'Referencia Avanzada'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X className={`w-5 h-5 ${getTextColor()}`} strokeWidth={2} />
            </button>
          </div>

          {/* Content */}
          <div className={`${getTextColor()} text-sm leading-relaxed`}>
            <p className="whitespace-pre-wrap">{hint}</p>
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#2F6F6D] hover:bg-[#1F3A5F] dark:bg-[#4A9B98] dark:hover:bg-[#2F6F6D] text-white font-semibold rounded-lg transition-colors"
            >
              Entendido
            </button>
          </div>

          {/* Hint level indicator */}
          <div className="flex gap-1 justify-center mt-2">
            {['light', 'medium', 'strong'].map((level, idx) => (
              <div
                key={level}
                className={`h-1 w-8 rounded ${
                  hintLevel === level || idx < ['light', 'medium', 'strong'].indexOf(hintLevel)
                    ? 'bg-[#2F6F6D] dark:bg-[#4A9B98]'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
