import React from 'react';
import { useSchedule } from '../context/ScheduleContext';

export default function Header() {
  const { clearAllClasses, totalSubjectCount } = useSchedule();

  const handleClearAll = () => {
    if (totalSubjectCount === 0) return;
    if (window.confirm('Are you sure you want to clear the entire schedule?')) {
      clearAllClasses();
    }
  };

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-sky-500/20">
          <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center backdrop-blur-md">
            <i className="fa-solid fa-mobile-screen-button text-xl text-sky-400"></i>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Schedule Lock Screen Maker
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Glassmorphism Pro
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            High-Definition 1080×2412 Phone Wallpaper Generator &bull;{' '}
            <span className="text-slate-300 font-medium">By: Jay-ar S. De Guzman</span>
          </p>
        </div>
      </div>

      {/* Quick Action Top Bar */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleClearAll}
          className="glass-btn glass-btn-danger text-xs py-2 px-3.5"
          title="Clear all schedule subjects"
        >
          <i className="fa-solid fa-trash-can"></i>
          <span>Clear All</span>
        </button>
      </div>
    </header>
  );
}
