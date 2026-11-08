import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';

const SCALES = [75, 85, 100];

export default function PhoneToolbar() {
  const { appSettings, updateSettings } = useSchedule();

  return (
    <>
      {/* Responsive Phone Control Toolbar */}
      <div className="w-full max-w-[360px] flex items-center justify-between px-3 py-1.5 mb-2.5 rounded-full bg-slate-950/60 border border-white/10 text-xs text-slate-300 backdrop-blur-md">
        <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <i className="fa-solid fa-mobile-screen text-sky-400"></i> Preview Scale:
        </span>
        <div className="flex items-center gap-1">
          {SCALES.map((scale) => {
            const isSelected = (appSettings.previewScale || 100) === scale;
            return (
              <button
                key={scale}
                type="button"
                onClick={() => updateSettings({ previewScale: scale })}
                className={`preview-scale-btn px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  isSelected
                    ? 'bg-sky-500/30 text-sky-300 border border-sky-400/40'
                    : 'text-slate-400'
                }`}
              >
                {scale}%
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive helper hint */}
      <div className="glass-panel-subtle px-3.5 py-1.5 rounded-full mb-3 flex items-center gap-2 text-[11px] text-sky-300">
        <i className="fa-solid fa-arrow-pointer text-xs"></i>
        <span>Interactive: Click class to edit &bull; Drag photo to pan</span>
      </div>
    </>
  );
}

