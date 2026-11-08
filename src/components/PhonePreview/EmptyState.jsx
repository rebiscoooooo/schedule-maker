import React from 'react';

export default function EmptyState() {
  return (
    <div
      id="phone-empty-state"
      className="day-card text-center"
      style={{
        display: 'block',
        padding: '22px 14px',
        border: '1px dashed rgba(255, 255, 255, 0.2)',
        background: 'rgba(15, 23, 42, 0.5)',
      }}
    >
      <i className="fa-regular fa-calendar-plus text-sky-400 text-2xl mb-2 block"></i>
      <div className="text-[11px] font-bold text-white tracking-wide">No Classes Added Yet</div>
      <div className="text-[9px] text-slate-400 mt-1 leading-relaxed">
        Add your classes manually or use Smart Import to create your lock screen!
      </div>
    </div>
  );
}

