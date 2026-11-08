import React from 'react';
import { useSchedule } from '../context/ScheduleContext';

export default function Toast() {
  const { toast } = useSchedule();

  let typeClasses = 'border-sky-500/40 bg-slate-900/90 text-sky-200';
  let iconClass = 'fa-solid fa-circle-info text-sky-400 text-lg';

  if (toast.type === 'success') {
    typeClasses = 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200';
    iconClass = 'fa-solid fa-circle-check text-emerald-400 text-lg';
  } else if (toast.type === 'danger') {
    typeClasses = 'border-rose-500/40 bg-rose-950/80 text-rose-200';
    iconClass = 'fa-solid fa-triangle-exclamation text-rose-400 text-lg';
  } else if (toast.type === 'warning') {
    typeClasses = 'border-amber-500/40 bg-amber-950/80 text-amber-200';
    iconClass = 'fa-solid fa-circle-exclamation text-amber-400 text-lg';
  }

  return (
    <div
      id="toast-notification"
      className={`glass-panel p-4 flex items-center gap-3 max-w-sm rounded-2xl shadow-2xl transition-all duration-300 ${typeClasses} ${
        toast.visible ? 'show' : ''
      }`}
    >
      <i id="toast-icon" className={iconClass}></i>
      <div id="toast-message" className="text-xs font-semibold text-white">
        {toast.message}
      </div>
    </div>
  );
}

