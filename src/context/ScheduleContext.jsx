import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { STORAGE_KEY, SETTINGS_KEY, DAYS_OF_WEEK, DEFAULT_SETTINGS } from '../constants/config';

const ScheduleContext = createContext(null);

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

export function parseTimeForSorting(timeStr) {
  if (!timeStr || timeStr === 'TBA') return 9999;
  const startTime = timeStr.split('-')[0].trim();
  const match = startTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM|A|P)?/i);
  if (!match) return 9999;
  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const ampm = match[3] ? match[3].toUpperCase() : null;
  if (ampm && ampm.startsWith('P') && hours < 12) hours += 12;
  if (ampm && ampm.startsWith('A') && hours === 12) hours = 0;
  if (!ampm && hours >= 1 && hours <= 6) {
    hours += 12;
  }
  return (hours * 60) + mins;
}

const initialSchedule = DAYS_OF_WEEK.reduce((acc, day) => {
  acc[day] = [];
  return acc;
}, {});

function loadInitialSchedule() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const data = { ...initialSchedule };
      DAYS_OF_WEEK.forEach(day => {
        if (Array.isArray(parsed[day])) {
          data[day] = parsed[day].filter(item =>
            !item.subject?.includes('DATA STRUCTURES') &&
            !item.subject?.includes('WEB SYSTEMS') &&
            !item.subject?.includes('APPLIED STATS') &&
            !item.subject?.includes('NETWORK ADMIN') &&
            !item.subject?.includes('INFO ASSURANCE') &&
            !item.subject?.includes('CAPSTONE 4101') &&
            !item.subject?.includes('DISCRETE MATH')
          );
        }
      });
      return data;
    }
  } catch (e) {
    console.warn('Error loading schedule from localStorage:', e);
  }
  return initialSchedule;
}

function loadInitialSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Error loading settings from localStorage:', e);
  }
  return DEFAULT_SETTINGS;
}

export function ScheduleProvider({ children }) {
  const [scheduleData, setScheduleData] = useState(loadInitialSchedule);
  const [appSettings, setAppSettings] = useState(loadInitialSettings);
  const [editingClass, setEditingClass] = useState(null); // { day, id, time, subject, room } or null
  const [activeTab, setActiveTab] = useState('manual');
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  const [ocrModal, setOcrModal] = useState({ visible: false, progress: 0, status: '' });

  // Sync scheduleData to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scheduleData));
    } catch (e) {
      console.warn('Could not save scheduleData to localStorage:', e);
    }
  }, [scheduleData]);

  // Sync appSettings to localStorage and CSS custom properties
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
    } catch (e) {
      console.warn('Could not save appSettings to localStorage:', e);
    }

    const root = document.documentElement;
    const opacity = (appSettings.cardOpacity ?? 72) / 100;
    const blur = appSettings.cardBlur ?? 24;
    root.style.setProperty('--card-opacity', opacity);
    root.style.setProperty('--card-blur', `${blur}px`);
  }, [appSettings]);

  // Toast Timer
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => (prev.message === message ? { ...prev, visible: false } : prev));
    }, 3800);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  // Update Settings Partial
  const updateSettings = useCallback((partial) => {
    setAppSettings(prev => ({ ...prev, ...partial }));
  }, []);

  // Add Class
  const addClass = useCallback((day, time, subject, room) => {
    let success = false;
    setScheduleData(prev => {
      const currentList = prev[day] || [];
      if (currentList.length >= 20) {
        showToast('Limit Reached: Max 20 subjects per day!', 'warning');
        return prev;
      }
      const newEntry = {
        id: generateId(),
        time: time || 'TBA',
        subject: subject || 'SUBJECT',
        room: room || 'TBA',
        sortValue: parseTimeForSorting(time)
      };
      const updatedList = [...currentList, newEntry].sort((a, b) => a.sortValue - b.sortValue);
      success = true;
      return { ...prev, [day]: updatedList };
    });
    return success;
  }, [showToast]);

  // Update Class
  const updateClass = useCallback((origDay, origId, newDay, time, subject, room) => {
    setScheduleData(prev => {
      const currentDayList = (prev[origDay] || []).filter(item => item.id !== origId);
      const newEntry = {
        id: origId,
        time: time || 'TBA',
        subject: subject || 'SUBJECT',
        room: room || 'TBA',
        sortValue: parseTimeForSorting(time)
      };

      if (origDay === newDay) {
        const updated = [...currentDayList, newEntry].sort((a, b) => a.sortValue - b.sortValue);
        return { ...prev, [origDay]: updated };
      } else {
        const targetDayList = [...(prev[newDay] || []), newEntry].sort((a, b) => a.sortValue - b.sortValue);
        return {
          ...prev,
          [origDay]: currentDayList,
          [newDay]: targetDayList
        };
      }
    });
    setEditingClass(null);
    showToast('Subject updated successfully!', 'success');
  }, [showToast]);

  // Delete Class
  const deleteClass = useCallback((day, id) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: (prev[day] || []).filter(item => item.id !== id)
    }));
    showToast('Subject removed from schedule.', 'info');
  }, [showToast]);

  // Clear All
  const clearAllClasses = useCallback(() => {
    setScheduleData(DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {}));
    showToast('Schedule cleared.', 'info');
  }, [showToast]);

  // Bulk Import
  const importClasses = useCallback((classesArray) => {
    if (!classesArray || classesArray.length === 0) return 0;
    let addedCount = 0;
    setScheduleData(prev => {
      const nextData = { ...prev };
      classesArray.forEach(({ day, time, subject, room }) => {
        if (!nextData[day]) nextData[day] = [];
        if (nextData[day].length < 20) {
          nextData[day] = [...nextData[day], {
            id: generateId(),
            time: time || 'TBA',
            subject: subject || 'SUBJECT',
            room: room || 'TBA',
            sortValue: parseTimeForSorting(time)
          }].sort((a, b) => a.sortValue - b.sortValue);
          addedCount++;
        }
      });
      return nextData;
    });
    return addedCount;
  }, []);

  // Start Editing
  const startEditing = useCallback((day, id) => {
    const list = scheduleData[day] || [];
    const item = list.find(c => c.id === id);
    if (item) {
      setEditingClass({ day, ...item });
      setActiveTab('manual');
    }
  }, [scheduleData]);

  // Cancel Editing
  const cancelEditing = useCallback(() => {
    setEditingClass(null);
  }, []);

  // Total subjects count
  const totalSubjectCount = useMemo(() => {
    return DAYS_OF_WEEK.reduce((acc, day) => acc + (scheduleData[day]?.length || 0), 0);
  }, [scheduleData]);

  const value = {
    scheduleData,
    appSettings,
    editingClass,
    activeTab,
    toast,
    ocrModal,
    totalSubjectCount,
    showToast,
    hideToast,
    setOcrModal,
    updateSettings,
    addClass,
    updateClass,
    deleteClass,
    clearAllClasses,
    importClasses,
    startEditing,
    cancelEditing,
    setActiveTab,
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}

