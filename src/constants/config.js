export const STORAGE_KEY = 'schedule_maker_v3_data';
export const SETTINGS_KEY = 'schedule_maker_v3_settings';

export const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const TINT_COLORS = {
  midnight: [2, 6, 23],    // Slate / Darkest Blue
  plum: [30, 8, 48],       // Deep Purple
  forest: [2, 26, 20],     // Deep Emerald / Forest
  rose: [36, 8, 20],       // Deep Crimson / Noir Rose
  crystal: [241, 245, 249] // Pale Ice / Light Tint
};

export const TINT_SWATCHES = [
  { id: 'midnight', bg: '#020617', label: 'Midnight Slate' },
  { id: 'plum', bg: '#1e0830', label: 'Cosmic Plum' },
  { id: 'forest', bg: '#021a14', label: 'Emerald Forest' },
  { id: 'rose', bg: '#240814', label: 'Noir Rose' },
  { id: 'crystal', bg: '#f1f5f9', label: 'Frosted Ice' },
];

export const GLOW_OPTIONS = [
  { id: 'default', label: 'Default', ringColor: 'ring-sky-400', borderClass: 'border-white/10 text-slate-300' },
  { id: 'cyan', label: 'Cyan Glow', ringColor: 'ring-sky-400', borderClass: 'border-sky-400/30 text-sky-300' },
  { id: 'violet', label: 'Violet Glow', ringColor: 'ring-sky-400', borderClass: 'border-purple-400/30 text-purple-300' },
  { id: 'emerald', label: 'Emerald Glow', ringColor: 'ring-sky-400', borderClass: 'border-emerald-400/30 text-emerald-300' },
  { id: 'rose', label: 'Rose Glow', ringColor: 'ring-sky-400', borderClass: 'border-rose-400/30 text-rose-300' },
  { id: 'gold', label: 'Amber Glow', ringColor: 'ring-sky-400', borderClass: 'border-amber-400/30 text-amber-300' },
  { id: 'crystal', label: 'Crystal Specular', ringColor: 'ring-sky-400', borderClass: 'border-white/40 text-slate-100' },
];

export const DEFAULT_SETTINGS = {
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
  previewScale: 100,  // 75, 85, 100
  showClockOverlay: false
};

export const HD_WALLPAPER_CONFIG = {
  // Canvas & Resolution Settings
  dimensions: {
    width: 360,           // Base phone width in CSS pixels
    height: 804,          // Base phone height in CSS pixels
    scale: 3,             // 360 x 804 at 3x scale = 1080 x 2412 HD Wallpaper
    backgroundColor: '#020617', // Fallback background color
    outputFileName: 'schedule.png'
  },
  // Header Styling ("CLASS", "Schedule", Semester subtitle) - SYNCHRONIZED WITH CSS
  header: {
    paddingTop: '190px',      // Space reserved at top for mobile lock screen clock
    marginBottom: '14px',
    // "CLASS" Serif Heading
    classHeading: {
      fontFamily: "'Cinzel', serif",
      fontSize: '30px',
      fontWeight: '900',
      letterSpacing: '12px',
      marginLeft: '40px',
      marginBottom: '-28px',
      color: '#ffffff',
      textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
      lineHeight: '1'
    },
    // "Schedule" Cursive Script
    scheduleScript: {
      fontFamily: "'Great Vibes', cursive",
      fontSize: '84px',
      fontWeight: '500',
      color: '#ffffff',
      height: 'auto',
      marginBottom: '8px',
      opacity: '0.8',
      textShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 255, 255, 0.15)',
      lineHeight: '1'
    },
    // Semester Subtitle (e.g., "1ST SEMESTER AY. 2026-2027")
    semesterSubtitle: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: '7px',
      fontWeight: '700',
      letterSpacing: '6px',
      marginLeft: '6px',
      marginTop: '24px',
      marginBottom: '10px',
      color: '#ffffff',
      textTransform: 'uppercase',
      textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
      lineHeight: '1.2'
    }
  },
  // Glassmorphic Day Card Design ("MONDAY", "TUESDAY", etc.)
  cards: {
    borderRadius: '18px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.14)',
    backgroundBase: 'rgba(14, 21, 38, {opacity})',
    defaultOpacity: 0.65,
    defaultBlur: 24,
    padding: '10px 14px'
  },
  // Day Header ("MONDAY", "TUESDAY") inside each card
  dayTitle: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '2px',
    color: '#7d8fa6',
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '5px',
    marginBottom: '6px'
  },
  // Time Pill Badge Design ("8:00-10:00", etc.)
  timeBadge: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: '9px',
    fontWeight: '600',
    color: '#cbd5e1',
    background: 'rgba(4, 9, 20, 0.65)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '6px',
    letterSpacing: '0.5px',
    padding: '0 7px',
    height: '18px',
    compactHeight: '16px',
    compactFontSize: '8px'
  },
  // Subject Typography
  subject: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '0.3px',
    lineHeight: '1.3'
  },
  // Room Typography
  room: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '9px',
    fontWeight: '500',
    color: '#8e9fb5',
    lineHeight: '1.3'
  }
};
