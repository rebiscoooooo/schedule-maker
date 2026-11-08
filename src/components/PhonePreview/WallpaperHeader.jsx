import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';

export default function WallpaperHeader() {
  const { appSettings } = useSchedule();

  return (
    <div className="schedule-header">
      <div className="header-class">{appSettings.headerClass || 'CLASS'}</div>
      <div className="header-schedule">{appSettings.headerSchedule || 'Schedule'}</div>
      <div className="header-semester">
        {appSettings.headerSemester || '2ND SEMESTER AY. 2026-2027'}
      </div>
    </div>
  );
}

