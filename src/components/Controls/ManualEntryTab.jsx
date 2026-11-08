import React, { useState, useEffect } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { DAYS_OF_WEEK } from '../../constants/config';

const TIME_PRESETS = ['7:30 - 9:00', '10:00 - 12:00', '1:00 - 3:00', 'TBA'];

export default function ManualEntryTab() {
  const { editingClass, addClass, updateClass, cancelEditing, showToast } = useSchedule();

  const [day, setDay] = useState('MONDAY');
  const [time, setTime] = useState('');
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');

  // Whenever editingClass changes, sync inputs
  useEffect(() => {
    if (editingClass) {
      setDay(editingClass.day || 'MONDAY');
      setTime(editingClass.time || '');
      setSubject(editingClass.subject || '');
      setRoom(editingClass.room || '');
    } else {
      setDay('MONDAY');
      setTime('');
      setSubject('');
      setRoom('');
    }
  }, [editingClass]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanTime = time.trim() || 'TBA';
    const cleanSubject = subject.trim().toUpperCase() || 'SUBJECT';
    const cleanRoom = room.trim().toUpperCase() || 'TBA';

    if (editingClass) {
      updateClass(editingClass.day, editingClass.id, day, cleanTime, cleanSubject, cleanRoom);
    } else {
      const ok = addClass(day, cleanTime, cleanSubject, cleanRoom);
      if (ok) {
        showToast('Subject added to schedule!', 'success');
        setTime('');
        setSubject('');
        setRoom('');
      }
    }
  };

  return (
    <div id="tab-manual" className="tab-content-panel">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2" id="formHeader">
          {editingClass ? (
            <span className="text-sky-400 flex items-center gap-2">
              <i className="fa-solid fa-pen"></i> Editing Subject
            </span>
          ) : (
            <>
              <i className="fa-regular fa-square-plus text-sky-400"></i> Add Subject Manually:
            </>
          )}
        </h2>
        {editingClass && (
          <button
            type="button"
            onClick={cancelEditing}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
          >
            <i className="fa-solid fa-xmark"></i> Cancel Edit
          </button>
        )}
      </div>

      <form id="scheduleForm" onSubmit={handleSubmit} className="space-y-4">
        {/* Day Selection */}
        <div>
          <label htmlFor="dayInput" className="block text-xs font-semibold text-slate-300 mb-1.5">
            Target Day
          </label>
          <select
            id="dayInput"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="glass-input cursor-pointer font-medium"
          >
            {DAYS_OF_WEEK.map((d) => (
              <option key={d} value={d}>
                {d.charAt(0) + d.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Time & Room */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="timeInput" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Time Range
            </label>
            <input
              type="text"
              id="timeInput"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="glass-input font-mono"
              placeholder="e.g. 11:30 - 1:00 or 7:30AM"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 mr-1 self-center">Presets:</span>
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTime(preset)}
                  className="time-preset-tag text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="roomInput" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Room / Laboratory
            </label>
            <input
              type="text"
              id="roomInput"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="glass-input uppercase"
              placeholder="e.g. IT LAB 1 or LEC 203"
            />
          </div>
        </div>

        {/* Subject Code */}
        <div>
          <label htmlFor="subjectInput" className="block text-xs font-semibold text-slate-300 mb-1.5">
            Subject Name / Code
          </label>
          <input
            type="text"
            id="subjectInput"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="glass-input uppercase font-semibold"
            placeholder="e.g. INTECH 3100 WEB SYSTEMS"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="submitBtn"
          className="glass-btn glass-btn-primary w-full py-3.5 mt-2 text-sm tracking-wide shadow-lg"
        >
          {editingClass ? (
            <>
              <i className="fa-solid fa-check"></i>
              <span>Save Changes</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-plus"></i>
              <span>Save Subject</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

