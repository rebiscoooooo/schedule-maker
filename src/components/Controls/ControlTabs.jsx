import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';

export default function ControlTabs() {
  const { activeTab, setActiveTab, totalSubjectCount } = useSchedule();

  return (
    <div className="flex items-center gap-2 p-1.5 bg-slate-950/50 rounded-2xl border border-white/5 mb-6 overflow-x-auto">
      <button
        type="button"
        className={`nav-tab-pill ${activeTab === 'manual' ? 'active' : ''}`}
        onClick={() => setActiveTab('manual')}
      >
        <i className="fa-solid fa-pen-nib"></i>
        <span>Manual Entry</span>
      </button>
      <button
        type="button"
        className={`nav-tab-pill ${activeTab === 'import' ? 'active' : ''}`}
        onClick={() => setActiveTab('import')}
      >
        <i className="fa-solid fa-bolt-lightning text-amber-400"></i>
        <span>Smart Import</span>
      </button>
      <button
        type="button"
        className={`nav-tab-pill ${activeTab === 'themes' ? 'active' : ''}`}
        onClick={() => setActiveTab('themes')}
      >
        <i className="fa-solid fa-palette text-pink-400"></i>
        <span>Themes & Text</span>
      </button>
      <button
        type="button"
        className={`nav-tab-pill ${activeTab === 'manage' ? 'active' : ''}`}
        onClick={() => setActiveTab('manage')}
      >
        <i className="fa-solid fa-list-check text-emerald-400"></i>
        <span>
          Manage (<span id="total-subject-count">{totalSubjectCount}</span>)
        </span>
      </button>
    </div>
  );
}

