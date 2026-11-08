/**
 * ============================================================================
 * LOCK SCREEN SCHEDULE MAKER - HD WALLPAPER EXPORT MODULE
 * React Edition (src/utils/exportWallpaper.js)
 * True WYSIWYG Engine: Guarantees 100% Identical Output to Phone Mockup UI
 * ============================================================================
 */

import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { HD_WALLPAPER_CONFIG } from '../constants/config';

/**
 * Generate High-Definition 1080x2412 Wallpaper Canvas
 * Captures the live #wallpaper-area element directly from the DOM so that
 * the exported wallpaper is 100% pixel-identical to what is seen in the preview.
 * @param {Object} appSettings - Application settings
 * @returns {Promise<HTMLCanvasElement>} Rendered wallpaper canvas
 */
export async function generateHDWallpaperCanvas(appSettings) {
  await document.fonts.ready;
  const cfg = HD_WALLPAPER_CONFIG;
  const originalArea = document.getElementById('wallpaper-area');

  if (!originalArea) throw new Error('Wallpaper area element #wallpaper-area not found.');

  // Find phone-wrapper if present (which may have scale-75 or scale-85)
  const phoneWrapper = originalArea.closest('.phone-wrapper');
  const prevWrapperTransform = phoneWrapper ? phoneWrapper.style.transform : '';
  const prevWrapperMargin = phoneWrapper ? phoneWrapper.style.marginBottom : '';
  const prevRadius = originalArea.style.borderRadius;

  // Temporarily reset preview wrapper transform so html2canvas renders at exact 1:1 base scale
  // and remove border-radius so the wallpaper fills the full 1080x2412 rectangle cleanly
  if (phoneWrapper) {
    phoneWrapper.style.transform = 'none';
    phoneWrapper.style.marginBottom = '0px';
  }
  originalArea.style.borderRadius = '0px';

  // Small delay to ensure the browser has updated layout
  await new Promise(r => setTimeout(r, 60));

  let finalCanvas;
  try {
    finalCanvas = await html2canvas(originalArea, {
      width: cfg.dimensions.width,
      height: cfg.dimensions.height,
      scale: cfg.dimensions.scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: cfg.dimensions.backgroundColor || '#020617',
      logging: false
    });
  } finally {
    // Restore the phone preview mockup UI immediately
    originalArea.style.borderRadius = prevRadius;
    if (phoneWrapper) {
      phoneWrapper.style.transform = prevWrapperTransform;
      phoneWrapper.style.marginBottom = prevWrapperMargin;
    }
  }

  return finalCanvas;
}

/**
 * Export Lock Screen Wallpaper in High Definition (1080x2412)
 */
export async function exportWallpaper(appSettings, showToast) {
  const cfg = HD_WALLPAPER_CONFIG;
  try {
    const canvas = await generateHDWallpaperCanvas(appSettings);
    const link = document.createElement('a');
    link.download = cfg.dimensions.outputFileName;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignored if confetti fails
    }

    if (showToast) {
      showToast('Wallpaper downloaded in crisp 1080×2412 HD!', 'success');
    }
  } catch (err) {
    console.error('Export Error:', err);
    if (showToast) {
      showToast('Error generating wallpaper. Please try again.', 'danger');
    }
    throw err;
  }
}

/**
 * Copy Lock Screen Wallpaper image directly to clipboard
 */
export async function copyWallpaperToClipboard(appSettings, showToast) {
  try {
    const canvas = await generateHDWallpaperCanvas(appSettings);
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          if (showToast) showToast('Failed to create image.', 'danger');
          reject(new Error('Failed to create image blob'));
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          if (showToast) {
            showToast('Wallpaper copied directly to clipboard!', 'success');
          }
          resolve();
        } catch (clipErr) {
          console.warn('Clipboard write failed:', clipErr);
          if (showToast) {
            showToast('Clipboard not allowed in this browser. Please use Download.', 'warning');
          }
          resolve();
        }
      }, 'image/png');
    });
  } catch (err) {
    console.error('Copy Error:', err);
    if (showToast) {
      showToast('Error copying wallpaper image.', 'danger');
    }
    throw err;
  }
}
