import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';

export default function ClassRow({ day, item }) {
  const { startEditing } = useSchedule();

  return (
    <div
      className="class-row"
      title="Click to edit or remove"
      onClick={() => startEditing(day, item.id)}
    >
      <div className="class-time">{item.time}</div>
      <div className="class-subject">{item.subject}</div>
      <div className="class-room">{item.room}</div>
    </div>
  );
}

