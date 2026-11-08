import React from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { THEMES } from '../../constants/themes';
import { TINT_SWATCHES, GLOW_OPTIONS } from '../../constants/config';

export default function ThemesTab() {
  const { appSettings, updateSettings, showToast } = useSchedule();

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      updateSettings({ customBg: dataUrl });
      showToast('Custom wallpaper background applied! You can resize, pan, and blur it below.', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    updateSettings({ customBg: null });
    showToast('Custom background cleared.', 'info');
  };

  const adjustScale = (delta) => {
    const current = appSettings.customBgScale || 100;
    const next = Math.max(50, Math.min(250, current + delta));
    updateSettings({ customBgScale: next });
  };

  return (
    <div id="tab-themes" className="tab-content-panel space-y-6">
      {/* SECTION 1: Wallpaper Themes (14 Themes) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-wand-magic text-sky-400"></i> Aesthetic Color & Glass Themes
          </label>
          <span className="text-[10px] text-slate-400">14 Presets</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
          {THEMES.map((theme) => {
            const isActive = appSettings.theme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => updateSettings({ theme: theme.id })}
                className={`theme-card p-2.5 rounded-xl border text-left transition-all hover:border-sky-400/50 ${
                  isActive ? 'ring-2 ring-sky-400 border-sky-400/80' : 'border-white/10'
                }`}
                style={theme.style}
              >
                <div className={`text-xs font-bold ${theme.titleClass}`}>
                  {theme.icon && <i className={theme.icon}></i>} {theme.name}
                </div>
                <div className="text-[9px] text-slate-400">{theme.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Custom Photo Background with Resizing, Positioning & Blur */}
      <div className="glass-panel-subtle p-4 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-2">
            <i className="fa-regular fa-image text-sky-400"></i> Custom Photo Wallpaper
          </label>
          <span className="text-[10px] text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-400/20">
            Full Adjustment Controls
          </span>
        </div>

        {!appSettings.customBg ? (
          /* When no photo is selected */
          <div id="photo-upload-dropzone">
            <label className="dropzone-box flex flex-col items-center justify-center group py-4 cursor-pointer">
              <i className="fa-solid fa-cloud-arrow-up text-2xl text-sky-400 group-hover:scale-110 transition-transform mb-1.5"></i>
              <span className="text-xs font-bold text-white">Choose Wallpaper Photo</span>
              <span className="text-[10px] text-slate-400">
                Upload anime, landscape, or personal photo (JPG, PNG, WEBP)
              </span>
              <input
                type="file"
                id="customBgUpload"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
        ) : (
          /* When photo IS loaded */
          <div id="photo-controls-box" className="space-y-3.5 pt-1">
            {/* Thumbnail & Actions */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <img
                  id="photo-thumbnail-preview"
                  src={appSettings.customBg}
                  className="w-11 h-11 rounded-lg object-cover border border-white/20 shadow-md"
                  alt="Thumb"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Photo Active</span>
                    <i className="fa-solid fa-circle-check text-emerald-400 text-[10px]"></i>
                  </div>
                  <div className="text-[10px] text-slate-400">Custom wallpaper enabled</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label
                  className="glass-btn glass-btn-secondary text-[11px] py-1.5 px-2.5 cursor-pointer"
                  title="Replace with another photo"
                >
                  <i className="fa-solid fa-arrows-rotate text-sky-400"></i> Replace
                  <input
                    type="file"
                    id="customBgUploadReplace"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
                <button
                  type="button"
                  id="removeCustomBgBtn"
                  onClick={handleRemovePhoto}
                  className="glass-btn glass-btn-danger text-[11px] py-1.5 px-2.5"
                  title="Remove custom photo"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>

            {/* Photo Scale / Zoom Control */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <i className="fa-solid fa-magnifying-glass-plus text-sky-400 text-[11px]"></i>
                  Photo Size / Zoom
                </span>
                <div className="flex items-center gap-2">
                  <span
                    id="photo-scale-value"
                    className="font-mono text-xs text-sky-300 font-bold bg-sky-950/50 px-2 py-0.5 rounded border border-sky-800/40"
                  >
                    {appSettings.customBgScale || 100}%
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      id="zoomOutPhotoBtn"
                      onClick={() => adjustScale(-10)}
                      className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center text-slate-300"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      id="zoomResetPhotoBtn"
                      onClick={() => updateSettings({ customBgScale: 100 })}
                      className="px-1.5 h-6 rounded bg-white/5 hover:bg-white/10 text-[10px] flex items-center justify-center text-slate-300"
                    >
                      100%
                    </button>
                    <button
                      type="button"
                      id="zoomInPhotoBtn"
                      onClick={() => adjustScale(10)}
                      className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center text-slate-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <input
                type="range"
                id="customBgScale"
                min="50"
                max="250"
                step="5"
                value={appSettings.customBgScale || 100}
                onChange={(e) => updateSettings({ customBgScale: parseInt(e.target.value, 10) })}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Photo Position Pan X & Y */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Horizontal Pan (X)</span>
                  <span id="photo-posx-value" className="font-mono text-sky-300">
                    {appSettings.customBgPosX ?? 50}%
                  </span>
                </div>
                <input
                  type="range"
                  id="customBgPosX"
                  min="0"
                  max="100"
                  step="1"
                  value={appSettings.customBgPosX ?? 50}
                  onChange={(e) => updateSettings({ customBgPosX: parseInt(e.target.value, 10) })}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Vertical Pan (Y)</span>
                  <span id="photo-posy-value" className="font-mono text-sky-300">
                    {appSettings.customBgPosY ?? 50}%
                  </span>
                </div>
                <input
                  type="range"
                  id="customBgPosY"
                  min="0"
                  max="100"
                  step="1"
                  value={appSettings.customBgPosY ?? 50}
                  onChange={(e) => updateSettings({ customBgPosY: parseInt(e.target.value, 10) })}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Position Quick Presets & Drag Hint */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <div className="flex items-center gap-1">
                <span>Align:</span>
                <button
                  type="button"
                  onClick={() => updateSettings({ customBgPosX: 50, customBgPosY: 0 })}
                  className="pos-preset-btn px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300"
                >
                  Top
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ customBgPosX: 50, customBgPosY: 50 })}
                  className="pos-preset-btn px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300"
                >
                  Center
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ customBgPosX: 50, customBgPosY: 100 })}
                  className="pos-preset-btn px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300"
                >
                  Bottom
                </button>
              </div>
              <span className="text-sky-300 font-medium">
                <i className="fa-solid fa-hand text-[9px]"></i> Drag on phone to pan!
              </span>
            </div>

            {/* Background Blur Control */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <i className="fa-solid fa-droplet text-sky-400 text-[11px]"></i> Photo Blur (Depth of Field)
                </span>
                <span
                  id="photo-blur-value"
                  className="font-mono text-xs text-sky-300 font-bold bg-sky-950/50 px-2 py-0.5 rounded border border-sky-800/40"
                >
                  {appSettings.customBgBlur || 0}px
                </span>
              </div>
              <input
                type="range"
                id="customBgBlur"
                min="0"
                max="25"
                step="1"
                value={appSettings.customBgBlur || 0}
                onChange={(e) => updateSettings({ customBgBlur: parseInt(e.target.value, 10) })}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">
                Add soft blur to busy photos so schedule text remains crystal-clear.
              </span>
            </div>

            {/* Darkening Tint Opacity & Tint Color */}
            <div className="space-y-2 pt-1 border-t border-white/10">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Darkening Tint Opacity</span>
                <span
                  id="photo-opacity-value"
                  className="font-mono text-xs text-sky-300 font-bold bg-sky-950/50 px-2 py-0.5 rounded border border-sky-800/40"
                >
                  {Math.round((appSettings.customBgOpacity ?? 0.65) * 100)}%
                </span>
              </div>
              <input
                type="range"
                id="customBgOpacity"
                min="0.1"
                max="0.95"
                step="0.05"
                value={appSettings.customBgOpacity ?? 0.65}
                onChange={(e) => updateSettings({ customBgOpacity: parseFloat(e.target.value) })}
                className="w-full accent-sky-400 cursor-pointer"
              />

              {/* Tint Color Swatches */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] text-slate-400">Tint Color:</span>
                <div className="flex items-center gap-2">
                  {TINT_SWATCHES.map((swatch) => {
                    const isSelected = (appSettings.customBgTintColor || 'midnight') === swatch.id;
                    return (
                      <button
                        key={swatch.id}
                        type="button"
                        onClick={() => updateSettings({ customBgTintColor: swatch.id })}
                        className={`tint-color-btn w-6 h-6 rounded-full border border-white/20 transition-all ${
                          isSelected ? 'ring-2 ring-sky-400' : ''
                        }`}
                        style={{ background: swatch.bg }}
                        title={swatch.label}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Card Glassmorphism Fine-Tuning */}
      <div className="glass-panel-subtle p-4 rounded-2xl space-y-3.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-2">
            <i className="fa-regular fa-clone text-sky-400"></i> Card Glassmorphism Controls
          </label>
          <span className="text-[10px] text-slate-400">Customize card frosted glass</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Card Glass Opacity</span>
              <span id="card-opacity-value" className="font-mono text-sky-300 font-bold">
                {appSettings.cardOpacity ?? 72}%
              </span>
            </div>
            <input
              type="range"
              id="cardOpacity"
              min="20"
              max="95"
              step="5"
              value={appSettings.cardOpacity ?? 72}
              onChange={(e) => updateSettings({ cardOpacity: parseInt(e.target.value, 10) })}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Glass Blur Intensity</span>
              <span id="card-blur-value" className="font-mono text-sky-300 font-bold">
                {appSettings.cardBlur ?? 24}px
              </span>
            </div>
            <input
              type="range"
              id="cardBlur"
              min="8"
              max="40"
              step="2"
              value={appSettings.cardBlur ?? 24}
              onChange={(e) => updateSettings({ cardBlur: parseInt(e.target.value, 10) })}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Card Glow Accent */}
        <div className="pt-1">
          <span className="text-[11px] text-slate-300 block mb-2 font-semibold">Card Border Glow:</span>
          <div className="flex flex-wrap gap-1.5">
            {GLOW_OPTIONS.map((opt) => {
              const isSelected = (appSettings.cardGlow || 'default') === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateSettings({ cardGlow: opt.id })}
                  className={`card-glow-btn text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border transition-all ${
                    opt.borderClass
                  } ${isSelected ? 'ring-2 ring-sky-400' : ''}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 4: Editable Header Typography */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-300">Lock Screen Title Text</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">Main Title (Cinzel)</span>
            <input
              type="text"
              id="customClassText"
              value={appSettings.headerClass || 'CLASS'}
              onChange={(e) => updateSettings({ headerClass: e.target.value.toUpperCase() })}
              className="glass-input text-xs uppercase"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">Script Title (Cursive)</span>
            <input
              type="text"
              id="customScheduleText"
              value={appSettings.headerSchedule || 'Schedule'}
              onChange={(e) => updateSettings({ headerSchedule: e.target.value })}
              className="glass-input text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">Semester / Year</span>
            <input
              type="text"
              id="customSemesterText"
              value={appSettings.headerSemester || '2ND SEMESTER AY. 2026-2027'}
              onChange={(e) => updateSettings({ headerSemester: e.target.value.toUpperCase() })}
              className="glass-input text-xs uppercase"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

