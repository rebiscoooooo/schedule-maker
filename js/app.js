/**
 * Main Application Logic & Event Handlers
 * Lock Screen Schedule Maker
 */

// Active edit state tracking
let editingContext = null;

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
    // 1. Load persisted data & settings
    loadFromStorage();

    // 2. Populate inputs from loaded settings
    const classInput = document.getElementById('customClassText');
    const scheduleInput = document.getElementById('customScheduleText');
    const semesterInput = document.getElementById('customSemesterText');

    const scaleInput = document.getElementById('customBgScale');
    const posXInput = document.getElementById('customBgPosX');
    const posYInput = document.getElementById('customBgPosY');
    const blurInput = document.getElementById('customBgBlur');
    const overlayOpacityInput = document.getElementById('customBgOpacity');

    const cardOpacityInput = document.getElementById('cardOpacity');
    const cardBlurInput = document.getElementById('cardBlur');

    if (classInput) classInput.value = appSettings.headerClass;
    if (scheduleInput) scheduleInput.value = appSettings.headerSchedule;
    if (semesterInput) semesterInput.value = appSettings.headerSemester;

    if (scaleInput) scaleInput.value = appSettings.customBgScale || 100;
    if (posXInput) posXInput.value = appSettings.customBgPosX ?? 50;
    if (posYInput) posYInput.value = appSettings.customBgPosY ?? 50;
    if (blurInput) blurInput.value = appSettings.customBgBlur || 0;
    if (overlayOpacityInput) overlayOpacityInput.value = appSettings.customBgOpacity ?? 0.65;

    if (cardOpacityInput) cardOpacityInput.value = appSettings.cardOpacity ?? 72;
    if (cardBlurInput) cardBlurInput.value = appSettings.cardBlur ?? 24;

    // 3. Render wallpaper visuals
    applyWallpaperTheme(appSettings.theme);
    updateHeaderTexts();
    applyCardGlassSettings();
    applyPreviewScale(appSettings.previewScale || 100);

    if (appSettings.customBg) {
        applyCustomBackground(appSettings.customBg);
    }

    renderAllDays();
    renderScheduleManagementTable();

    // 4. Setup drag panning on phone preview
    setupPhotoInteractiveDrag();

    // 5. Bind event listeners
    bindEventListeners();
    triggerAutoAdjust();
});

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    if (!toast || !toastMsg) return;

    toastMsg.innerText = message;

    // Style adjustments based on type
    toast.className = 'glass-panel p-4 flex items-center gap-3 max-w-sm rounded-2xl shadow-2xl transition-all duration-300';
    if (type === 'success') {
        toast.classList.add('border-emerald-500/40', 'bg-emerald-950/80', 'text-emerald-200');
        if (toastIcon) toastIcon.className = 'fa-solid fa-circle-check text-emerald-400 text-lg';
    } else if (type === 'danger') {
        toast.classList.add('border-rose-500/40', 'bg-rose-950/80', 'text-rose-200');
        if (toastIcon) toastIcon.className = 'fa-solid fa-triangle-exclamation text-rose-400 text-lg';
    } else if (type === 'warning') {
        toast.classList.add('border-amber-500/40', 'bg-amber-950/80', 'text-amber-200');
        if (toastIcon) toastIcon.className = 'fa-solid fa-circle-exclamation text-amber-400 text-lg';
    } else {
        toast.classList.add('border-sky-500/40', 'bg-slate-900/90', 'text-sky-200');
        if (toastIcon) toastIcon.className = 'fa-solid fa-circle-info text-sky-400 text-lg';
    }

    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3800);
}

/**
 * Start editing an existing subject
 */
function startEditClass(day, id) {
    const itemIndex = (scheduleData[day] || []).findIndex(item => item.id === id);
    if (itemIndex > -1) {
        const item = scheduleData[day][itemIndex];
        editingContext = { day, id };

        // Populate manual form
        document.getElementById('dayInput').value = day;
        document.getElementById('timeInput').value = item.time;
        document.getElementById('subjectInput').value = item.subject;
        document.getElementById('roomInput').value = item.room;

        // Switch to Manual Tab
        switchTab('manual');

        // Update form UI to editing mode
        const formHeader = document.getElementById('formHeader');
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');

        if (formHeader) formHeader.innerHTML = '<span class="text-sky-400 flex items-center gap-2"><i class="fa-solid fa-pen"></i> Editing Subject</span>';
        if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save Changes';
        if (cancelBtn) cancelBtn.classList.remove('hidden');

        // Scroll to form if on mobile
        document.getElementById('scheduleForm')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Cancel edit mode
 */
function cancelEdit() {
    editingContext = null;
    const form = document.getElementById('scheduleForm');
    if (form) form.reset();

    const formHeader = document.getElementById('formHeader');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');

    if (formHeader) formHeader.innerText = 'Add Subject Manually:';
    if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add to Schedule';
    if (cancelBtn) cancelBtn.classList.add('hidden');
}

/**
 * Delete class and refresh view
 */
function deleteClassAndRefresh(day, id) {
    deleteClassFromData(day, id);
    renderDay(day);
    renderScheduleManagementTable();
    showToast('Subject removed from schedule.', 'info');
}

/**
 * Switch dashboard navigation tabs
 */
function switchTab(tabId) {
    document.querySelectorAll('.nav-tab-pill').forEach(btn => {
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.querySelectorAll('.tab-content-panel').forEach(panel => {
        if (panel.id === `tab-${tabId}`) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    });
}

/**
 * Bind all DOM Event Listeners
 */
function bindEventListeners() {
    // 1. Navigation Tab switching
    document.querySelectorAll('.nav-tab-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // 2. Manual Schedule Form Submit
    const form = document.getElementById('scheduleForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const day = document.getElementById('dayInput').value;
            const time = document.getElementById('timeInput').value.trim() || 'TBA';
            const subject = document.getElementById('subjectInput').value.trim().toUpperCase() || 'SUBJECT';
            const room = document.getElementById('roomInput').value.trim().toUpperCase() || 'TBA';

            if (editingContext) {
                deleteClassFromData(editingContext.day, editingContext.id);
                addClassToData(day, time, subject, room);
                showToast('Subject updated successfully!', 'success');
                cancelEdit();
            } else {
                if (addClassToData(day, time, subject, room)) {
                    showToast('Subject added to schedule!', 'success');
                    document.getElementById('timeInput').value = '';
                    document.getElementById('subjectInput').value = '';
                    document.getElementById('roomInput').value = '';
                }
            }

            renderAllDays();
            renderScheduleManagementTable();
        });
    }

    // 3. Quick time preset tags
    document.querySelectorAll('.time-preset-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const timeInput = document.getElementById('timeInput');
            if (timeInput) {
                timeInput.value = tag.dataset.time;
            }
        });
    });

    // 4. Live Custom Header Inputs
    const classInput = document.getElementById('customClassText');
    const scheduleInput = document.getElementById('customScheduleText');
    const semesterInput = document.getElementById('customSemesterText');

    if (classInput) {
        classInput.addEventListener('input', (e) => {
            appSettings.headerClass = e.target.value.toUpperCase();
            updateHeaderTexts();
            saveToStorage();
        });
    }
    if (scheduleInput) {
        scheduleInput.addEventListener('input', (e) => {
            appSettings.headerSchedule = e.target.value;
            updateHeaderTexts();
            saveToStorage();
        });
    }
    if (semesterInput) {
        semesterInput.addEventListener('input', (e) => {
            appSettings.headerSemester = e.target.value.toUpperCase();
            updateHeaderTexts();
            saveToStorage();
        });
    }

    // 5. Theme Selection Cards (14 Themes)
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            const theme = card.dataset.theme;
            applyWallpaperTheme(theme);
        });
    });

    // 6. Custom Background Wallpaper Upload
    const customBgInput = document.getElementById('customBgUpload');
    const customBgInputReplace = document.getElementById('customBgUploadReplace');

    const handleFile = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            appSettings.customBg = event.target.result;
            applyCustomBackground(appSettings.customBg);
            saveToStorage();
            showToast('Custom wallpaper background applied! You can resize, pan, and blur it below.', 'success');
        };
        reader.readAsDataURL(file);
    };

    if (customBgInput) {
        customBgInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
    }
    if (customBgInputReplace) {
        customBgInputReplace.addEventListener('change', (e) => handleFile(e.target.files[0]));
    }

    // 7. Remove Custom Background
    const removeBgBtn = document.getElementById('removeCustomBgBtn');
    if (removeBgBtn) {
        removeBgBtn.addEventListener('click', () => {
            appSettings.customBg = null;
            applyCustomBackground(null);
            saveToStorage();
            showToast('Custom background cleared.', 'info');
        });
    }

    // 8. Custom Background Photo Scale (Zoom)
    const scaleSlider = document.getElementById('customBgScale');
    if (scaleSlider) {
        scaleSlider.addEventListener('input', (e) => {
            appSettings.customBgScale = parseInt(e.target.value, 10);
            updatePhotoTransform();
            saveToStorage();
        });
    }

    // Zoom In / Out Buttons
    document.getElementById('zoomInPhotoBtn')?.addEventListener('click', () => {
        appSettings.customBgScale = Math.min(250, (appSettings.customBgScale || 100) + 10);
        if (scaleSlider) scaleSlider.value = appSettings.customBgScale;
        updatePhotoTransform();
        saveToStorage();
    });

    document.getElementById('zoomOutPhotoBtn')?.addEventListener('click', () => {
        appSettings.customBgScale = Math.max(50, (appSettings.customBgScale || 100) - 10);
        if (scaleSlider) scaleSlider.value = appSettings.customBgScale;
        updatePhotoTransform();
        saveToStorage();
    });

    document.getElementById('zoomResetPhotoBtn')?.addEventListener('click', () => {
        appSettings.customBgScale = 100;
        if (scaleSlider) scaleSlider.value = 100;
        updatePhotoTransform();
        saveToStorage();
    });

    // 9. Position X and Y Sliders
    const posXSlider = document.getElementById('customBgPosX');
    if (posXSlider) {
        posXSlider.addEventListener('input', (e) => {
            appSettings.customBgPosX = parseInt(e.target.value, 10);
            updatePhotoTransform();
            saveToStorage();
        });
    }

    const posYSlider = document.getElementById('customBgPosY');
    if (posYSlider) {
        posYSlider.addEventListener('input', (e) => {
            appSettings.customBgPosY = parseInt(e.target.value, 10);
            updatePhotoTransform();
            saveToStorage();
        });
    }

    // Position Presets
    document.querySelectorAll('.pos-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const x = parseInt(btn.dataset.posx, 10);
            const y = parseInt(btn.dataset.posy, 10);
            appSettings.customBgPosX = x;
            appSettings.customBgPosY = y;
            if (posXSlider) posXSlider.value = x;
            if (posYSlider) posYSlider.value = y;
            updatePhotoTransform();
            saveToStorage();
        });
    });

    // 10. Photo Blur Slider
    const blurSlider = document.getElementById('customBgBlur');
    if (blurSlider) {
        blurSlider.addEventListener('input', (e) => {
            appSettings.customBgBlur = parseInt(e.target.value, 10);
            updatePhotoTransform();
            saveToStorage();
        });
    }

    // 11. Darkening Tint Opacity Slider
    const opacitySlider = document.getElementById('customBgOpacity');
    if (opacitySlider) {
        opacitySlider.addEventListener('input', (e) => {
            appSettings.customBgOpacity = parseFloat(e.target.value);
            updatePhotoTint();
            saveToStorage();
        });
    }

    // 12. Tint Color Swatches
    document.querySelectorAll('.tint-color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            appSettings.customBgTintColor = btn.dataset.tint;
            updatePhotoTint();
            saveToStorage();
        });
    });

    // 13. Card Glassmorphism Opacity Slider
    const cardOpacitySlider = document.getElementById('cardOpacity');
    if (cardOpacitySlider) {
        cardOpacitySlider.addEventListener('input', (e) => {
            appSettings.cardOpacity = parseInt(e.target.value, 10);
            applyCardGlassSettings();
            saveToStorage();
        });
    }

    // 14. Card Glassmorphism Blur Slider
    const cardBlurSlider = document.getElementById('cardBlur');
    if (cardBlurSlider) {
        cardBlurSlider.addEventListener('input', (e) => {
            appSettings.cardBlur = parseInt(e.target.value, 10);
            applyCardGlassSettings();
            saveToStorage();
        });
    }

    // 15. Card Glow Accent Buttons
    document.querySelectorAll('.card-glow-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            appSettings.cardGlow = btn.dataset.glow;
            applyCardGlassSettings();
            saveToStorage();
        });
    });

    // 16. Preview Scale Controls (75%, 85%, 100%)
    document.querySelectorAll('.preview-scale-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const scale = parseInt(btn.dataset.scale, 10);
            applyPreviewScale(scale);
        });
    });

    // 17. Clock Overlay Toggle
    const clockToggle = document.getElementById('toggleClockPreview');
    const clockOverlay = document.getElementById('lockscreen-overlay');
    if (clockToggle && clockOverlay) {
        clockToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                clockOverlay.classList.remove('hidden-overlay');
            } else {
                clockOverlay.classList.add('hidden-overlay');
            }
        });
    }

    // 18. Clear All Schedule
    const clearBtn = document.getElementById('clearAllBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the entire schedule?')) {
                clearAllScheduleData();
                renderAllDays();
                renderScheduleManagementTable();
                showToast('Schedule cleared.', 'info');
            }
        });
    }

    // 20. Smart Import from Text Button
    const importBtn = document.getElementById('importTextBtn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const rawText = document.getElementById('form6Input')?.value;
            if (!rawText || !rawText.trim()) {
                showToast('Please paste your schedule text first.', 'warning');
                return;
            }
            const count = parseScheduleText(rawText);
            if (count > 0) {
                showToast(`Successfully imported ${count} classes!`, 'success');
            } else {
                showToast('No valid subjects recognized in text.', 'warning');
            }
        });
    }

    // Window resize event for phone auto adjust
    window.addEventListener('resize', triggerAutoAdjust);
}

/**
 * Generate High-Definition 1080x2412 Wallpaper Canvas using WYSIWYG isolated export
 * Guarantees that what you see in the phone preview is exactly what you get in the exported wallpaper.
 */
async function generateHDWallpaperCanvas() {
    await document.fonts.ready;

    const originalArea = document.getElementById('wallpaper-area');
    if (!originalArea) throw new Error('Wallpaper area not found');

    // 1. Get current transform of live cardsContainer (WYSIWYG: preserves the exact scale the user sees)
    const liveCardsContainer = originalArea.querySelector('.cards-container');
    const liveContentBody = originalArea.querySelector('.content-body');
    let currentCardsTransform = liveCardsContainer ? liveCardsContainer.style.transform : 'scale(1)';

    // If auto-adjust hasn't calculated yet or is scale(1), calculate it synchronously to guarantee fit
    if (liveContentBody && liveCardsContainer) {
        const availHeight = liveContentBody.clientHeight;
        const scrollH = liveCardsContainer.scrollHeight;
        if (scrollH > availHeight && availHeight > 0) {
            const scaleRatio = (availHeight / scrollH) * 0.96;
            currentCardsTransform = `scale(${scaleRatio})`;
        }
    }

    // 2. Create isolated offscreen container attached to body
    // Immune to screen zoom, browser window size, preview scale (75%/85%/100%), and scroll positions
    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'fixed';
    exportContainer.style.top = '0';
    exportContainer.style.left = '-9999px';
    exportContainer.style.width = '360px';
    exportContainer.style.height = '804px';
    exportContainer.style.overflow = 'hidden';
    exportContainer.style.background = '#020617';
    exportContainer.style.zIndex = '999999';
    exportContainer.style.pointerEvents = 'none';

    // 3. Deep clone the live wallpaper area
    const clone = originalArea.cloneNode(true);
    clone.id = 'wallpaper-area-export-clone';
    clone.style.position = 'relative';
    clone.style.top = '0';
    clone.style.left = '0';
    clone.style.width = '360px';
    clone.style.height = '804px';
    clone.style.borderRadius = '0'; // Clean rectangular edges for phone wallpaper
    clone.style.transform = 'none';
    clone.style.margin = '0';

    // Remove clock overlay and empty state placeholder from export
    const clock = clone.querySelector('#lockscreen-overlay');
    if (clock) clock.remove();
    const empty = clone.querySelector('#phone-empty-state');
    if (empty) empty.remove();

    // Disable any hover states on class rows
    clone.querySelectorAll('.class-row').forEach(row => {
        row.style.pointerEvents = 'none';
        row.style.transform = 'none';
    });

    // Apply the exact scale to clone's cards container
    const cloneCards = clone.querySelector('.cards-container');
    if (cloneCards && currentCardsTransform) {
        cloneCards.style.transform = currentCardsTransform;
    }

    // Sanitize all cards in clone to guarantee 100% glitch-free WYSIWYG export:
    const cardOpacity = (appSettings.cardOpacity ?? 65) / 100;
    clone.querySelectorAll('.day-card').forEach(card => {
        card.style.boxShadow = 'none';
        card.style.backdropFilter = 'none';
        card.style.webkitBackdropFilter = 'none';
        card.style.border = '1px solid rgba(255, 255, 255, 0.08)';
        card.style.borderTop = '1px solid rgba(255, 255, 255, 0.14)';
        card.style.borderRadius = '18px';
        card.style.background = `rgba(14, 21, 38, ${cardOpacity})`;
    });

    // Perfectly center class time badges in html2canvas export
    clone.querySelectorAll('.class-time').forEach(el => {
        const isCompact = el.closest('.compact-mode') !== null;
        el.style.display = 'inline-flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.height = isCompact ? '16px' : '18px';
        el.style.lineHeight = '1';
        el.style.boxSizing = 'border-box';
        const text = el.innerText.trim();
        const offset = isCompact ? -2 : -2.5;
        el.innerHTML = `<span style="position:relative; top:${offset}px; display:inline-block; line-height:1;">${text}</span>`;
    });

    // Ensure custom background image in clone is loaded and styled
    const cloneBgImg = clone.querySelector('#wallpaper-custom-bg');
    if (cloneBgImg && appSettings.customBg) {
        cloneBgImg.src = appSettings.customBg;
        const scale = (appSettings.customBgScale || 100) / 100;
        const posX = appSettings.customBgPosX ?? 50;
        const posY = appSettings.customBgPosY ?? 50;
        const blur = appSettings.customBgBlur || 0;
        cloneBgImg.style.transform = `scale(${scale})`;
        cloneBgImg.style.objectPosition = `${posX}% ${posY}%`;
        cloneBgImg.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
    }

    exportContainer.appendChild(clone);
    document.body.appendChild(exportContainer);

    // Wait for custom background image to finish decoding if present
    if (cloneBgImg && appSettings.customBg && !cloneBgImg.complete) {
        await new Promise(resolve => {
            cloneBgImg.onload = cloneBgImg.onerror = resolve;
            setTimeout(resolve, 500);
        });
    }

    // Small tick to ensure styles are applied
    await new Promise(r => setTimeout(r, 60));

    let canvas;
    try {
        canvas = await html2canvas(clone, {
            width: 360,
            height: 804,
            scale: 3, // 360 x 804 * 3 = 1080 x 2412 px HD
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#020617',
            logging: false
        });
    } finally {
        exportContainer.remove();
    }

    return canvas;
}

/**
 * Export Lock Screen Wallpaper in High Definition (1080x2412)
 */
async function exportWallpaper() {
    const exportBtn = document.getElementById('exportWallpaperBtn');
    const originalBtnText = exportBtn ? exportBtn.innerHTML : '';
    if (exportBtn) {
        exportBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating 1080×2412 HD Wallpaper...';
        exportBtn.disabled = true;
    }

    try {
        const canvas = await generateHDWallpaperCanvas();

        // Trigger file download
        const link = document.createElement('a');
        link.download = `lockscreen-schedule-2-2627.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();

        // Confetti celebration if library is available
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        showToast('Wallpaper downloaded in crisp 1080×2412 HD!', 'success');
    } catch (err) {
        console.error("Export Error: ", err);
        showToast("Error generating wallpaper. Please try again.", 'danger');
    } finally {
        if (exportBtn) {
            exportBtn.innerHTML = originalBtnText;
            exportBtn.disabled = false;
        }
    }
}

/**
 * Copy Lock Screen Wallpaper image directly to clipboard
 */
async function copyWallpaperToClipboard() {
    const copyBtn = document.getElementById('copyWallpaperBtn');
    const originalBtnText = copyBtn ? copyBtn.innerHTML : '';
    if (copyBtn) {
        copyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-sky-400"></i>';
        copyBtn.disabled = true;
    }

    try {
        const canvas = await generateHDWallpaperCanvas();
        canvas.toBlob(async (blob) => {
            if (!blob) {
                showToast('Failed to create image.', 'danger');
                return;
            }
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                showToast('Wallpaper copied directly to clipboard!', 'success');
            } catch (clipErr) {
                console.warn('Clipboard write failed:', clipErr);
                showToast('Clipboard not allowed in this browser. Please use Download.', 'warning');
            }
        }, 'image/png');
    } catch (err) {
        console.error("Copy Error: ", err);
        showToast("Error copying wallpaper image.", 'danger');
    } finally {
        if (copyBtn) {
            copyBtn.innerHTML = originalBtnText;
            copyBtn.disabled = false;
        }
    }
}
