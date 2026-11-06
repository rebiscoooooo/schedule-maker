# Lock Screen Schedule Maker (Glassmorphism Pro Edition)

> Elegant, high-definition 1080×2412 mobile phone lock screen wallpaper generator designed for students.

**Created by:** Jay-ar Saturno De Guzman  
**Academic Year:** 2026 - 2027

---

## ✨ Features & Enhancements

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
  - **AI OCR Recognition:** Scan schedule photos with `tesseract.js` featuring real-time recognition progress.
  - **Regex Parser:** Paste raw schedule text with automated day, time, and room detection.
- 📱 **1080×2412 HD Lock Screen Export:** Tailored 3× scaling (`html2canvas`) delivering ultra-crisp AMOLED/Retina wallpapers with celebratory confetti!
- 💾 **Local Persistence:** Preserves your schedule and theme customizations across browser refreshes using `localStorage`.

---

## 📂 Project Architecture

```
schedule-maker/
├── index.html                   # Semantic markup, Tailwind CSS, Font Awesome 6
├── README.md                    # Project documentation
├── css/
│   ├── glassmorphism.css        # Ambient background orbs, frosted glass components, custom scrollbars
│   └── phone-mockup.css         # Smartphone bezel, 14 theme styles, photo transform, cards & auto-scaling
└── js/
    ├── state.js                 # Schedule store, localStorage synchronization
    ├── importer.js              # PDF.js extractor, Tesseract OCR with progress, regex parser
    ├── renderer.js              # Phone rendering, photo transforms, auto-scaling, interactive drag
    └── app.js                   # Application lifecycle, theme switching, sliders, html2canvas HD export
```

---

## 🛠️ Tech Stack & Open-Source Libraries

- **Tailwind CSS** (via CDN)
- **Font Awesome 6** (Modern icon set)
- **Google Fonts** (*Plus Jakarta Sans*, *Cinzel*, *Great Vibes*, *Montserrat*)
- **html2canvas** (Hi-res wallpaper capture)
- **PDF.js** (Multi-page document extraction)
- **Tesseract.js** (Client-side Optical Character Recognition)
- **Canvas Confetti** (Export celebration effect)