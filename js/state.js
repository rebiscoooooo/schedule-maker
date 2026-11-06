/**
 * State Management & Data Store
 * Lock Screen Schedule Maker
 */

const STORAGE_KEY = 'schedule_maker_v3_data';
const SETTINGS_KEY = 'schedule_maker_v3_settings';

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

// Initial State (Clean & Empty)
let scheduleData = {
    'MONDAY': [],
    'TUESDAY': [],
    'WEDNESDAY': [],
    'THURSDAY': [],
    'FRIDAY': [],
    'SATURDAY': []
};

let appSettings = {
    theme: 'obsidian',
    headerClass: 'CLASS',
    headerSchedule: 'Schedule',
    headerSemester: '2ND SEMESTER AY. 2026-2027',
    
    // Custom Background Photo Settings
    customBg: null,
    customBgScale: 100, // 50% to 250%
    customBgPosX: 50,   // 0% to 100%
    customBgPosY: 50,   // 0% to 100%
    customBgBlur: 0,    // 0px to 25px
    customBgOpacity: 0.65, // 0.1 to 0.95
    customBgTintColor: 'midnight', // midnight, plum, forest, rose, crystal
    
    // Glassmorphism Card Settings
    cardOpacity: 72,    // 20% to 95%
    cardBlur: 24,       // 8px to 40px
    cardGlow: 'default', // default, cyan, violet, emerald, rose, gold, crystal
    
    // Viewport & Preview Settings
    previewScale: 100,  // 75, 85, 100, 'fit'
    showClockOverlay: false
};

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

// Time parser for chronological sorting
function parseTimeForSorting(timeStr) {
    if (!timeStr || timeStr === 'TBA') return 9999;
    const startTime = timeStr.split('-')[0].trim();
    const match = startTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM|A|P)?/i);
    if (!match) return 9999;
    let hours = parseInt(match[1], 10);
    let mins = parseInt(match[2], 10);
    let ampm = match[3] ? match[3].toUpperCase() : null;
    if (ampm && ampm.startsWith('P') && hours < 12) hours += 12;
    if (ampm && ampm.startsWith('A') && hours === 12) hours = 0;
    if (!ampm && hours >= 1 && hours <= 6) {
        hours += 12; // Infer afternoon for 1:00-6:00 without explicit AM/PM
    }
    return (hours * 60) + mins;
}

// Local Storage Sync
function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scheduleData));
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

function loadFromStorage() {
    try {
        const savedSchedule = localStorage.getItem(STORAGE_KEY);
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSchedule) {
            const parsed = JSON.parse(savedSchedule);
            DAYS_OF_WEEK.forEach(day => {
                if (Array.isArray(parsed[day])) {
                    scheduleData[day] = parsed[day].filter(item => 
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
        }
        if (savedSettings) {
            appSettings = Object.assign(appSettings, JSON.parse(savedSettings));
        }
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
    }
}

// Add Class Function
function addClassToData(day, time, subject, room) {
    if (!scheduleData[day]) scheduleData[day] = [];
    if (scheduleData[day].length >= 20) {
        showToast('Limit Reached: Max 20 subjects per day!', 'warning');
        return false;
    }
    const newEntry = {
        id: generateId(),
        time: time || 'TBA',
        subject: subject || 'SUBJECT',
        room: room || 'TBA',
        sortValue: parseTimeForSorting(time)
    };
    scheduleData[day].push(newEntry);
    saveToStorage();
    return true;
}

// Delete Class
function deleteClassFromData(day, id) {
    if (!scheduleData[day]) return;
    scheduleData[day] = scheduleData[day].filter(item => item.id !== id);
    saveToStorage();
}

// Clear all
function clearAllScheduleData() {
    DAYS_OF_WEEK.forEach(day => {
        scheduleData[day] = [];
    });
    saveToStorage();
}
