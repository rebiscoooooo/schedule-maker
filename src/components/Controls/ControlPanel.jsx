import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import ControlTabs from './ControlTabs';
import ManualEntryTab from './ManualEntryTab';
import SmartImportTab from './SmartImportTab';
import ThemesTab from './ThemesTab';
import ManageTab from './ManageTab';
import ExportBar from './ExportBar';

export default function ControlPanel() {
  const { activeTab } = useSchedule();

  return (
    <div className="glass-panel p-5 sm:p-7">
      <ControlTabs />

      {activeTab === 'manual' && <ManualEntryTab />}
      {activeTab === 'import' && <SmartImportTab />}
      {activeTab === 'themes' && <ThemesTab />}
      {activeTab === 'manage' && <ManageTab />}

      <ExportBar />
    </div>
  );
}

