# Lock Screen Schedule Maker (React & Glassmorphism Pro Edition)

> Elegant, high-definition 1080×2412 mobile phone lock screen wallpaper generator designed for students. Fully migrated to **React 19**, **Vite**, and component-driven **.jsx** architecture.

**Created by:** Jay-ar Saturno De Guzman  
**Academic Year:** 2026 - 2027

---

## 🚀 Quick Start (Development & Build)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```
Creates an optimized static production bundle in `dist/`.

---

## ✨ Features & Enhancements

- ⚛️ **Modern React 19 & Vite Stack:** Clean modular component hierarchy, custom hooks, and centralized state management via `ScheduleContext`.
- 🪟 **True Glassmorphism UI:** Built with backdrop-blur filters, frosted glass panels, glowing specular borders, ambient animated gradients, and luxury dark aesthetics.
- 🎨 **14 Aesthetic Themes:**
  - *Obsidian* (Classic Dark)
  - *Crystal Frost* (Ultra Pure Glass)
  - *Aurora* (Teal Pine & Emerald)
  - *Nebula* (Cosmic Violet)
  - *Sapphire* (Midnight Blue)
  - *Liquid Titanium* (Chrome Metal)
  - *Rose Quartz* (Blush Gold)
  - *Jade Palace* (Emerald Glow)
  - *Sunset* (Crimson Dusk)
  - *Cyberpunk* (Neon Synth)
  - *Holo Prism* (Iridescent Pastel)
  - *Tokyo Neon* (Nightlife)
  - *Amber Glow* (Warm Topaz)
  - *Nordic Mist* (Minimal Arctic Slate)
- 🖼️ **Advanced Custom Photo Wallpaper Studio:**
  - **Zoom & Scale Slider:** Resize your background photo from 50% to 250%.
  - **2D Pan Position Controls:** Horizontal & Vertical alignment sliders with quick presets (*Top*, *Center*, *Bottom*).
  - **Interactive Drag on Phone Screen:** Click and drag or touch on the phone preview to freely position your background photo!
  - **Background Depth Blur:** Apple iOS-style Gaussian blur slider (0px to 25px) to soften busy photos.
  - **Darkening Tint & Colors:** Opacity slider with 5 color swatches (*Midnight*, *Plum*, *Forest*, *Rose*, *Crystal*).
- 💎 **Card Glassmorphism Fine-Tuning:**
  - Dynamic Card Opacity (20% to 95%) and Blur Intensity (8px to 40px).
  - 7 Border Glow accents (*Default*, *Cyan*, *Violet*, *Emerald*, *Rose*, *Amber*, *Crystal Specular*).
- 🔍 **Responsive Phone Preview:**
  - Preview Scale switcher (75%, 85%, 100%) so users on any screen size can view the full phone mockup without scrolling.
  - Interactive lock screen clock safe-zone overlay toggle.
- ⚡ **Smart Document Importers:**
  - **PDF Extraction:** Upload COR / enrollment forms via `pdf.js`.
  - **AI OCR Recognition:** Scan schedule photos with `tesseract.js` featuring real-time recognition progress bar.
  - **Regex Parser:** Paste raw schedule text with automated day, time, and room detection.
- 📱 **1080×2412 HD Lock Screen Export:** Tailored 3× scaling (`html2canvas`) delivering ultra-crisp AMOLED/Retina wallpapers with celebratory confetti!
- 💾 **Local Persistence:** Preserves your schedule and theme customizations across browser refreshes using `localStorage`.

---

## 📂 React Project Architecture

```
schedule-maker/
├── index.html                             # Vite HTML shell with Google Fonts & OCR CDN scripts
├── vite.config.js                         # Vite + React plugin configuration
├── package.json                           # Dependencies, module configuration, & build scripts
├── README.md                              # Project documentation
├── src/
│   ├── main.jsx                           # Application entry point
│   ├── App.jsx                            # Top-level layout container
│   ├── index.css                          # Ambient background, glassmorphism, & phone mockup styles
│   ├── constants/
│   │   ├── config.js                      # Config options, days of week, tint swatches, HD export config
│   │   └── themes.js                      # 14 Aesthetic wallpaper theme definitions
│   ├── context/
│   │   └── ScheduleContext.jsx            # State management, persistence sync, and actions
│   ├── components/
│   │   ├── Header.jsx                     # App navigation bar, badge, and clear-all action
│   │   ├── Toast.jsx                      # Floating alert notifications
│   │   ├── OcrModal.jsx                   # Scanning document progress modal
│   │   ├── Controls/
│   │   │   ├── ControlPanel.jsx           # Tab container wrapper
│   │   │   ├── ControlTabs.jsx            # Navigation pills (Manual, Import, Themes, Manage)
│   │   │   ├── ManualEntryTab.jsx         # Day select, time presets, room & subject inputs
│   │   │   ├── SmartImportTab.jsx         # PDF, Image OCR, and text regex parser dropzones
│   │   │   ├── ThemesTab.jsx              # 14 themes, photo studio, glass sliders, and header texts
│   │   │   ├── ManageTab.jsx              # Manage schedule list with edit/delete actions
│   │   │   └── ExportBar.jsx              # Lock screen clock toggle, Download & Copy buttons
│   │   └── PhonePreview/
│   │       ├── PhoneToolbar.jsx           # Scale buttons (75%, 85%, 100%) & drag hint
│   │       ├── PhoneMockup.jsx            # Dynamic Island, bezel, background drag, & auto-scaling
│   │       ├── WallpaperHeader.jsx        # Typography header ("CLASS", cursive "Schedule", Semester)
│   │       ├── DayCard.jsx                # Frosted glass day card with compact mode support
│   │       ├── ClassRow.jsx               # Individual subject row with centered time pill badge
│   │       └── EmptyState.jsx             # Empty schedule placeholder
│   └── utils/
│       ├── importer.js                    # PDF.js text extractor, Tesseract OCR, & regex parser
│       └── exportWallpaper.js             # 1080×2412 HD wallpaper export engine & clipboard copy
```

---

## 🛠️ Tech Stack & Open-Source Libraries

- **React 19** (`react`, `react-dom`)
- **Vite** (Next generation frontend tooling)
- **Tailwind CSS** (via CDN with extended brand color configuration)
- **Font Awesome 6** (Modern icon set)
- **Google Fonts** (*Cinzel*, *Great Vibes*, *Montserrat*, *Plus Jakarta Sans*, *Poppins*)
- **html2canvas** (1080×2412 HD wallpaper rasterization engine)
- **canvas-confetti** (Export celebration effect)
- **PDF.js** (Multi-page document extraction)
- **Tesseract.js** (Client-side Optical Character Recognition)
