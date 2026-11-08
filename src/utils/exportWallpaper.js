/**
 * ============================================================================
 * LOCK SCREEN SCHEDULE MAKER - HD WALLPAPER EXPORT MODULE
 * React Edition (src/utils/exportWallpaper.js)
 * True WYSIWYG Native Renderer: 100% Identical Output to Phone Mockup UI
 * ============================================================================
 */

import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { HD_WALLPAPER_CONFIG } from '../constants/config';

// Cache embedded @font-face & stylesheet CSS so repeat exports are instant
let cachedEmbeddedCss = null;

/**
 * Convert a Blob to a Base64 data URL
 */
function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Fetch any external resource (font/image) and return it as a Base64 data URL
 */
async function urlToDataURL(url) {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
    if (url && url.startsWith('blob:')) {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        return await blobToDataURL(blob);
      } catch {
        return url;
      }
    }
    return url;
  }
  try {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) return url;
    const blob = await res.blob();
    return await blobToDataURL(blob);
  } catch {
    return url;
  }
}

/**
 * Replace all url(...) references inside a CSS string with Base64 data URLs
 * so fonts and background assets render inside the isolated SVG foreignObject.
 */
async function inlineCssUrls(cssText, baseUrl) {
  const urlRegex = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
  const matches = [...cssText.matchAll(urlRegex)];
  if (matches.length === 0) return cssText;

  let result = cssText;
  const replacements = new Map();

  await Promise.all(
    matches.map(async (match) => {
      const fullMatch = match[0];
      const rawUrl = match[2].trim();
      if (rawUrl.startsWith('data:') || rawUrl.startsWith('#') || replacements.has(fullMatch)) {
        return;
      }
      try {
        const resolvedUrl = baseUrl ? new URL(rawUrl, baseUrl).href : rawUrl;
        const dataUrl = await urlToDataURL(resolvedUrl);
        replacements.set(fullMatch, `url("${dataUrl}")`);
      } catch {
        // Keep original URL if resolution fails
      }
    })
  );

  for (const [original, inlined] of replacements.entries()) {
    result = result.split(original).join(inlined);
  }

  return result;
}

/**
 * Collect all active stylesheets and @font-face rules with embedded Base64 fonts
 */
async function getEmbeddedStylesheets() {
  if (cachedEmbeddedCss) return cachedEmbeddedCss;

  const cssChunks = [];

  // 1. Process all <link rel="stylesheet"> and <style> elements in document order
  const styleNodes = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style')
  );

  for (const node of styleNodes) {
    if (node.tagName === 'LINK' && node.href) {
      try {
        const res = await fetch(node.href, { mode: 'cors' });
        if (res.ok) {
          const rawCss = await res.text();
          const inlinedCss = await inlineCssUrls(rawCss, node.href);
          cssChunks.push(inlinedCss);
          continue;
        }
      } catch {
        // Fall back to reading cssRules below if CORS fetch fails
      }
    }

    if (node.sheet) {
      try {
        const rules = Array.from(node.sheet.cssRules || []);
        const rawCss = rules.map((r) => r.cssText).join('\n');
        const inlinedCss = await inlineCssUrls(
          rawCss,
          node.href || document.baseURI
        );
        cssChunks.push(inlinedCss);
      } catch {
        if (node.tagName === 'STYLE' && node.textContent) {
          cssChunks.push(node.textContent);
        }
      }
    } else if (node.tagName === 'STYLE' && node.textContent) {
      cssChunks.push(node.textContent);
    }
  }

  cachedEmbeddedCss = cssChunks.join('\n');
  return cachedEmbeddedCss;
}

/**
 * Inline any external <img> or inline style background-image URLs on the cloned DOM
 * and lock exact element dimensions so zero reflow occurs during SVG serialization.
 */
async function prepareClonedTree(originalRoot, clonedRoot) {
  const origElements = [originalRoot, ...originalRoot.querySelectorAll('*')];
  const cloneElements = [clonedRoot, ...clonedRoot.querySelectorAll('*')];

  const tasks = [];

  for (let i = 0; i < origElements.length; i++) {
    const origEl = origElements[i];
    const cloneEl = cloneElements[i];
    if (!origEl || !cloneEl) continue;

    // Preserve exact inline background-image as data URL if needed
    if (cloneEl.style && cloneEl.style.backgroundImage) {
      const bg = cloneEl.style.backgroundImage;
      if (bg.includes('url(') && !bg.includes('data:')) {
        tasks.push(
          inlineCssUrls(bg, document.baseURI).then((inlined) => {
            cloneEl.style.backgroundImage = inlined;
          })
        );
      }
    }

    // Convert any <img> src to data URL
    if (cloneEl.tagName === 'IMG' && cloneEl.src && !cloneEl.src.startsWith('data:')) {
      tasks.push(
        urlToDataURL(cloneEl.src).then((dataUrl) => {
          cloneEl.src = dataUrl;
        })
      );
    }

    // If canvas elements exist inside, copy their bitmap
    if (origEl.tagName === 'CANVAS' && cloneEl.tagName === 'CANVAS') {
      try {
        const ctx = cloneEl.getContext('2d');
        if (ctx) ctx.drawImage(origEl, 0, 0);
      } catch {
        // Ignore empty canvas
      }
    }
  }

  await Promise.all(tasks);
}

/**
 * Extract all CSS custom properties (--*) from :root and body so themes match 1:1
 */
function getRootCssVariablesText() {
  const vars = [];
  const collectVars = (el) => {
    if (!el) return;
    const computed = window.getComputedStyle(el);
    for (let i = 0; i < computed.length; i++) {
      const prop = computed[i];
      if (prop.startsWith('--')) {
        vars.push(`${prop}: ${computed.getPropertyValue(prop)};`);
      }
    }
  };
  collectVars(document.documentElement);
  collectVars(document.body);
  return vars.join(' ');
}

/**
 * Render #wallpaper-area using the Browser's Native SVG <foreignObject> Engine
 * Guarantees 100% identical layout, fonts, blur, glassmorphism, and scaling.
 */
async function renderNativeForeignObjectCanvas(
  originalArea,
  baseWidth,
  baseHeight,
  targetWidth,
  targetHeight,
  fallbackBgColor
) {
  const embeddedCss = await getEmbeddedStylesheets();
  const rootVars = getRootCssVariablesText();
  const bodyComputed = window.getComputedStyle(document.body);

  // Deep-clone #wallpaper-area without altering the live phone mockup on screen
  const clonedArea = originalArea.cloneNode(true);
  await prepareClonedTree(originalArea, clonedArea);

  // Lock the exact mockup dimensions and remove phone frame border-radius for full-bleed wallpaper
  clonedArea.style.width = `${baseWidth}px`;
  clonedArea.style.height = `${baseHeight}px`;
  clonedArea.style.minWidth = `${baseWidth}px`;
  clonedArea.style.minHeight = `${baseHeight}px`;
  clonedArea.style.maxWidth = `${baseWidth}px`;
  clonedArea.style.maxHeight = `${baseHeight}px`;
  clonedArea.style.borderRadius = '0px';
  clonedArea.style.margin = '0px';
  clonedArea.style.transform = 'none';
  clonedArea.style.boxSizing = 'border-box';

  // Also lock .content-body height so flex calculations inside foreignObject match 1:1
  const origContentBody = originalArea.querySelector('.content-body');
  const cloneContentBody = clonedArea.querySelector('.content-body');
  if (origContentBody && cloneContentBody) {
    cloneContentBody.style.width = `${origContentBody.offsetWidth}px`;
    cloneContentBody.style.height = `${origContentBody.offsetHeight}px`;
  }

  // Wrap in .phone-wrapper > .phone-mockup shell so any ancestor CSS selectors match identically
  const wrapperShell = document.createElement('div');
  wrapperShell.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  wrapperShell.style.cssText = `${rootVars} width:${baseWidth}px; height:${baseHeight}px; margin:0; padding:0; overflow:hidden; font-family:${bodyComputed.fontFamily}; color:${bodyComputed.color}; -webkit-font-smoothing:antialiased;`;

  const mockupShell = document.createElement('div');
  mockupShell.className = 'phone-mockup';
  mockupShell.style.cssText = `width:${baseWidth}px; height:${baseHeight}px; margin:0; padding:0; border:none; border-radius:0; box-shadow:none; background:transparent; position:relative; overflow:hidden;`;

  mockupShell.appendChild(clonedArea);
  wrapperShell.appendChild(mockupShell);

  const serializedHtml = new XMLSerializer().serializeToString(wrapperShell);

  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${targetWidth}" height="${targetHeight}" viewBox="0 0 ${baseWidth} ${baseHeight}">
    <defs>
      <style type="text/css"><![CDATA[
        ${embeddedCss}
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      ]]></style>
    </defs>
    <foreignObject x="0" y="0" width="${baseWidth}" height="${baseHeight}">
      ${serializedHtml}
    </foreignObject>
  </svg>`;

  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;

  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = svgDataUrl;
  });

  if (img.decode) {
    try {
      await img.decode();
    } catch {
      // Continue if decode already resolved via onload
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = fallbackBgColor;
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return canvas;
}

/**
 * Generate High-Definition 1080x2412 Wallpaper Canvas
 * Captures the live #wallpaper-area element directly from the DOM so that
 * the exported wallpaper is 100% pixel-identical to what is seen in the preview.
 * @param {Object} appSettings - Application settings
 * @returns {Promise<HTMLCanvasElement>} Rendered wallpaper canvas
 */
export async function generateHDWallpaperCanvas(appSettings) {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const cfg = HD_WALLPAPER_CONFIG;
  const originalArea = document.getElementById('wallpaper-area');

  if (!originalArea) {
    throw new Error('Wallpaper area element #wallpaper-area not found.');
  }

  // Unscaled layout dimensions of the phone mockup screen (360 x 804)
  const baseWidth = originalArea.offsetWidth || 360;
  const baseHeight = originalArea.offsetHeight || 804;

  // Target HD Wallpaper output resolution (1080 x 2412)
  const targetWidth =
    cfg?.dimensions?.width && cfg.dimensions.width >= 720
      ? cfg.dimensions.width
      : 1080;
  const targetHeight =
    cfg?.dimensions?.height && cfg.dimensions.height >= 1600
      ? cfg.dimensions.height
      : 2412;
  const fallbackBgColor = cfg?.dimensions?.backgroundColor || '#020617';

  // Primary Engine: Native Browser SVG <foreignObject> Renderer (100% WYSIWYG)
  try {
    return await renderNativeForeignObjectCanvas(
      originalArea,
      baseWidth,
      baseHeight,
      targetWidth,
      targetHeight,
      fallbackBgColor
    );
  } catch (nativeErr) {
    console.warn(
      'Native SVG renderer encountered an issue, using calibrated html2canvas fallback:',
      nativeErr
    );
  }

  // Fallback Engine: Calibrated html2canvas with locked base dimensions & scroll reset
  const phoneWrapper = originalArea.closest('.phone-wrapper');
  const prevWrapperTransform = phoneWrapper ? phoneWrapper.style.transform : '';
  const prevWrapperMargin = phoneWrapper ? phoneWrapper.style.marginBottom : '';
  const prevRadius = originalArea.style.borderRadius;

  if (phoneWrapper) {
    phoneWrapper.style.transform = 'none';
    phoneWrapper.style.marginBottom = '0px';
  }
  originalArea.style.borderRadius = '0px';

  await new Promise((r) => setTimeout(r, 60));

  try {
    const scaleFactor = targetWidth / baseWidth;
    return await html2canvas(originalArea, {
      width: baseWidth,
      height: baseHeight,
      scale: scaleFactor,
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
      useCORS: true,
      allowTaint: true,
      backgroundColor: fallbackBgColor,
      logging: false,
    });
  } finally {
    originalArea.style.borderRadius = prevRadius;
    if (phoneWrapper) {
      phoneWrapper.style.transform = prevWrapperTransform;
      phoneWrapper.style.marginBottom = prevWrapperMargin;
    }
  }
}

/**
 * Export Lock Screen Wallpaper in High Definition (1080x2412)
 */
export async function exportWallpaper(appSettings, showToast) {
  const cfg = HD_WALLPAPER_CONFIG;
  try {
    const canvas = await generateHDWallpaperCanvas(appSettings);
    const link = document.createElement('a');
    link.download =
      cfg?.dimensions?.outputFileName || 'lockscreen-schedule-1080x2412.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
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
            new ClipboardItem({ 'image/png': blob }),
          ]);
          if (showToast) {
            showToast('Wallpaper copied directly to clipboard!', 'success');
          }
          resolve();
        } catch (clipErr) {
          console.warn('Clipboard write failed:', clipErr);
          if (showToast) {
            showToast(
              'Clipboard not allowed in this browser. Please use Download.',
              'warning'
            );
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