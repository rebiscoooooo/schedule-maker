import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import ClassRow from './ClassRow';

export default function DayCard({ day, items }) {
  const { appSettings } = useSchedule();

  if (!items || items.length === 0) return null;

  const isCompact = items.length >= 6;
  const glowClass = appSettings.cardGlow && appSettings.cardGlow !== 'default' ? `glow-${appSettings.cardGlow}` : '';

  return (
    <div
      id={`card-${day}`}
      className={`day-card ${isCompact ? 'compact-mode' : ''} ${glowClass}`}
      style={{ display: 'block' }}
    >
      <div className="day-title">
        <span>{day}</span>
      </div>
      <div id={`list-${day}`}>
        {items.map((item) => (
          <ClassRow key={item.id} day={day} item={item} />
        ))}
      </div>
    </div>
  );
}

