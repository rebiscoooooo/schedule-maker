import React from 'react';
import { useSchedule } from '../context/ScheduleContext';

export default function OcrModal() {
  const { ocrModal } = useSchedule();

  if (!ocrModal.visible) return null;

  return (
    <div
      id="ocr-progress-container"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
    >
      <div className="glass-panel p-6 max-w-sm w-full mx-4 text-center rounded-2xl shadow-2xl">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 text-xl animate-pulse">
          <i className="fa-solid fa-wand-magic-sparkles"></i>
        </div>
        <h4 className="text-sm font-bold text-white mb-1">Scanning Document</h4>
        <p id="ocr-progress-status" className="text-xs text-slate-300 mb-4">
          {ocrModal.status || 'Initializing OCR Engine...'}
        </p>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10">
          <div
            id="ocr-progress-bar"
            className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full transition-all duration-300"
            style={{ width: `${Math.max(5, Math.min(100, ocrModal.progress || 10))}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

