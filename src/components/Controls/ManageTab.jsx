import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { DAYS_OF_WEEK } from '../../constants/config';

export default function ManageTab() {
  const { scheduleData, startEditing, deleteClass, totalSubjectCount } = useSchedule();

  return (
    <div id="tab-manage" className="tab-content-panel">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-300 tracking-wide uppercase">All Configured Classes</h3>
        <span className="text-[11px] text-slate-400">Click edit or delete to modify</span>
      </div>

      <div id="schedule-manage-list" className="max-h-[380px] overflow-y-auto pr-1 space-y-3">
        {totalSubjectCount === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <i className="fa-regular fa-calendar-xmark text-3xl mb-2 block"></i>
            <p className="text-xs">
              No subjects added yet. Add your classes manually or use Smart Import to get started!
            </p>
          </div>
        ) : (
          DAYS_OF_WEEK.map((day) => {
            const items = scheduleData[day] || [];
            if (items.length === 0) return null;

            return (
              <div key={day} className="mb-4 glass-panel-subtle p-3 rounded-xl">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-slate-300 tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span> {day}
                  </span>
                  <span className="text-[10px] text-slate-400">{items.length} classes</span>
                </div>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 px-3 hover:bg-white/5 rounded-lg border-b border-white/5 last:border-0 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-semibold text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded border border-sky-800/40">
                          {item.time}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">{item.subject}</div>
                          <div className="text-[11px] text-slate-400">Room: {item.room}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(day, item.id)}
                          className="p-1.5 text-xs text-sky-400 hover:text-white hover:bg-sky-500/20 rounded-md transition-colors"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteClass(day, item.id)}
                          className="p-1.5 text-xs text-red-400 hover:text-white hover:bg-red-500/20 rounded-md transition-colors"
                          title="Delete"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

