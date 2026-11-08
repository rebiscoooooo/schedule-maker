import React, { useState } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { exportWallpaper, copyWallpaperToClipboard } from '../../utils/exportWallpaper';

export default function ExportBar() {
  const { appSettings, updateSettings, showToast } = useSchedule();
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await exportWallpaper(appSettings, showToast);
    } catch (err) {
      // Error handled inside exportWallpaper
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      await copyWallpaperToClipboard(appSettings, showToast);
    } catch (err) {
      // Error handled inside copyWallpaperToClipboard
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="mt-6 pt-5 border-t border-white/10 space-y-6">
      {/* Safe Zone Clock Overlay Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="fa-regular fa-clock text-sky-400 text-lg"></i>
          <div>
            <div className="text-xs font-bold text-white">Preview Lock Screen Clock</div>
            <div className="text-[11px] text-slate-400">Toggle lock screen clock overlay (hidden on export)</div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="toggleClockPreview"
            checked={!!appSettings.showClockOverlay}
            onChange={(e) => updateSettings({ showClockOverlay: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
        </label>
      </div>

      {/* Primary Export & Copy Buttons */}
      <div>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            id="exportWallpaperBtn"
            onClick={handleDownload}
            disabled={isExporting}
            className="glass-btn glass-btn-primary shimmer-btn flex-1 py-4 text-sm font-bold tracking-wider rounded-2xl shadow-2xl flex items-center justify-center gap-3"
          >
            {isExporting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Generating 1080 2412 HD Wallpaper...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-download text-base"></i>
                <span>Download 1080×2412 HD Wallpaper</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="copyWallpaperBtn"
            onClick={handleCopy}
            disabled={isCopying}
            className="glass-btn glass-btn-secondary py-4 px-5 text-sm font-bold rounded-2xl flex items-center justify-center gap-2"
            title="Copy wallpaper image directly to clipboard"
          >
            {isCopying ? (
              <i className="fa-solid fa-spinner fa-spin text-sky-400"></i>
            ) : (
              <>
                <i className="fa-regular fa-copy text-sky-400"></i>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <p className="text-[11px] text-center text-slate-400 mt-2">
          Exported in native crisp resolution tailored for modern AMOLED and Retina smartphone lock screens.
        </p>
      </div>
    </div>
  );
}

