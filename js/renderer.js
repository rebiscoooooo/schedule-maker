/**
 * UI & Phone Mockup Renderer
 * Lock Screen Schedule Maker
 */

let adjustTimeout = null;

// Tint color palette definitions
const TINT_COLORS = {
    midnight: [2, 6, 23],    // Slate / Darkest Blue
    plum: [30, 8, 48],       // Deep Purple
    forest: [2, 26, 20],     // Deep Emerald / Forest
    rose: [36, 8, 20],       // Deep Crimson / Noir Rose
    crystal: [241, 245, 249] // Pale Ice / Light Tint
};

/**
 * Auto-scales the cards container dynamically to fit within lock screen bounds
 */
function triggerAutoAdjust() {
    clearTimeout(adjustTimeout);
    adjustTimeout = setTimeout(() => {
        const contentBody = document.querySelector('.content-body');
        const cardsContainer = document.querySelector('.cards-container');
        if (!contentBody || !cardsContainer) return;

        // 1. Reset scale to allow DOM to measure raw unscaled height
        cardsContainer.style.transform = 'scale(1)';

        // 2. Wait a tick for DOM repaint before measuring
        setTimeout(() => {
            const availableHeight = contentBody.clientHeight;
            const contentHeight = cardsContainer.scrollHeight;

            if (contentHeight > availableHeight && availableHeight > 0) {
                // Apply a 0.96 buffer so it doesn't scrape the bottom of the screen
                const scaleRatio = (availableHeight / contentHeight) * 0.96;
                cardsContainer.style.transform = `scale(${scaleRatio})`;
            }
        }, 15);
    }, 40);
}

/**
 * Render a single day's card inside the phone mockup
 */
function renderDay(day) {
    const card = document.getElementById(`card-${day}`);
    const listContainer = document.getElementById(`list-${day}`);
    if (!card || !listContainer) return;

    listContainer.innerHTML = '';

    const dayItems = scheduleData[day] || [];

    if (dayItems.length === 0) {
        card.style.display = 'none';
        triggerAutoAdjust();
        return;
    }

    card.style.display = 'block';

    // Sort items chronologically
    dayItems.sort((a, b) => a.sortValue - b.sortValue);

    dayItems.forEach(classItem => {
        const row = document.createElement('div');
        row.className = 'class-row';
        row.setAttribute('title', 'Click to edit or remove');
        row.onclick = () => startEditClass(day, classItem.id);

        row.innerHTML = `
            <div class="class-time">${escapeHTML(classItem.time)}</div>
            <div class="class-subject">${escapeHTML(classItem.subject)}</div>
            <div class="class-room">${escapeHTML(classItem.room)}</div>
        `;
        listContainer.appendChild(row);
    });

    // Auto apply compact styling for days with 6+ classes
    if (dayItems.length >= 6) {
        card.classList.add('compact-mode');
    } else {
        card.classList.remove('compact-mode');
    }

    triggerAutoAdjust();
}

/**
 * Render all days on the phone mockup
 */
function renderAllDays() {
    DAYS_OF_WEEK.forEach(day => renderDay(day));
    updateSubjectCounter();

    const totalCount = DAYS_OF_WEEK.reduce((acc, day) => acc + (scheduleData[day]?.length || 0), 0);
    const emptyState = document.getElementById('phone-empty-state');
    if (emptyState) {
        emptyState.style.display = totalCount === 0 ? 'block' : 'none';
    }
}

/**
 * Update total subject counter in dashboard
 */
function updateSubjectCounter() {
    const totalCount = DAYS_OF_WEEK.reduce((acc, day) => acc + (scheduleData[day]?.length || 0), 0);
    const badge = document.getElementById('total-subject-count');
    if (badge) badge.innerText = `${totalCount} Subject${totalCount === 1 ? '' : 's'}`;
}

/**
 * Render Manage Schedule Table list
 */
function renderScheduleManagementTable() {
    const container = document.getElementById('schedule-manage-list');
    if (!container) return;

    container.innerHTML = '';
    let totalItems = 0;

    DAYS_OF_WEEK.forEach(day => {
        const items = scheduleData[day] || [];
        if (items.length === 0) return;

        totalItems += items.length;
        const daySection = document.createElement('div');
        daySection.className = 'mb-4 glass-panel-subtle p-3 rounded-xl';

        let rowsHTML = items.map(item => `
            <div class="flex items-center justify-between py-2 px-3 hover:bg-white/5 rounded-lg border-b border-white/5 last:border-0 transition-colors">
                <div class="flex items-center gap-3">
                    <span class="text-xs font-mono font-semibold text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded border border-sky-800/40">${escapeHTML(item.time)}</span>
                    <div>
                        <div class="text-xs font-bold text-white">${escapeHTML(item.subject)}</div>
                        <div class="text-[11px] text-slate-400">Room: ${escapeHTML(item.room)}</div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="startEditClass('${day}', '${item.id}')" class="p-1.5 text-xs text-sky-400 hover:text-white hover:bg-sky-500/20 rounded-md transition-colors" title="Edit">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button onclick="deleteClassAndRefresh('${day}', '${item.id}')" class="p-1.5 text-xs text-red-400 hover:text-white hover:bg-red-500/20 rounded-md transition-colors" title="Delete">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `).join('');

        daySection.innerHTML = `
            <div class="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <span class="text-xs font-bold text-slate-300 tracking-wider flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-sky-400 inline-block"></span> ${day}
                </span>
                <span class="text-[10px] text-slate-400">${items.length} classes</span>
            </div>
            <div class="space-y-1">${rowsHTML}</div>
        `;
        container.appendChild(daySection);
    });

    if (totalItems === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-slate-500">
                <i class="fa-regular fa-calendar-xmark text-3xl mb-2 block"></i>
                <p class="text-xs">No subjects added yet. Add your classes manually or use Smart Import to get started!</p>
            </div>
        `;
    }
}

/**
 * Apply wallpaper theme
 */
function applyWallpaperTheme(themeName) {
    const area = document.getElementById('wallpaper-area');
    if (!area) return;

    area.className = `theme-${themeName}`;
    if (appSettings.customBg) {
        area.classList.add('is-draggable');
    }
    appSettings.theme = themeName;
    saveToStorage();

    // Update active theme selector in UI
    document.querySelectorAll('.theme-card').forEach(card => {
        if (card.dataset.theme === themeName) {
            card.classList.add('ring-2', 'ring-sky-400', 'border-sky-400/80');
        } else {
            card.classList.remove('ring-2', 'ring-sky-400', 'border-sky-400/80');
        }
    });
}

/**
 * Update Header Texts
 */
function updateHeaderTexts() {
    const elClass = document.querySelector('.header-class');
    const elSchedule = document.querySelector('.header-schedule');
    const elSemester = document.querySelector('.header-semester');

    if (elClass) elClass.innerText = appSettings.headerClass || 'CLASS';
    if (elSchedule) elSchedule.innerText = appSettings.headerSchedule || 'Schedule';
    if (elSemester) elSemester.innerText = appSettings.headerSemester || '2ND SEMESTER AY. 2026-2027';
}

/**
 * Apply Custom Background Image with Scaling, Positioning, Blur & Tint
 */
function applyCustomBackground(imageDataUrl) {
    const container = document.getElementById('wallpaper-photo-container');
    const bgImg = document.getElementById('wallpaper-custom-bg');
    const bgOverlay = document.getElementById('wallpaper-bg-overlay');
    const wallpaperArea = document.getElementById('wallpaper-area');

    // Controls container
    const photoControlsBox = document.getElementById('photo-controls-box');
    const photoUploadDropzone = document.getElementById('photo-upload-dropzone');
    const photoThumbnail = document.getElementById('photo-thumbnail-preview');

    if (!bgImg || !bgOverlay || !container) return;

    if (imageDataUrl) {
        bgImg.src = imageDataUrl;
        container.style.display = 'block';
        bgOverlay.style.display = 'block';
        if (wallpaperArea) wallpaperArea.classList.add('is-draggable');

        // Apply scale, position, and blur
        updatePhotoTransform();

        // Apply tint color & opacity
        updatePhotoTint();

        // Update UI controls box
        if (photoControlsBox) photoControlsBox.classList.remove('hidden');
        if (photoUploadDropzone) photoUploadDropzone.classList.add('hidden');
        if (photoThumbnail) photoThumbnail.src = imageDataUrl;
    } else {
        bgImg.removeAttribute('src');
        container.style.display = 'none';
        bgOverlay.style.display = 'none';
        if (wallpaperArea) wallpaperArea.classList.remove('is-draggable');

        if (photoControlsBox) photoControlsBox.classList.add('hidden');
        if (photoUploadDropzone) photoUploadDropzone.classList.remove('hidden');
    }
}

/**
 * Update Photo Scale, Position & Blur
 */
function updatePhotoTransform() {
    const bgImg = document.getElementById('wallpaper-custom-bg');
    if (!bgImg) return;

    const scale = (appSettings.customBgScale || 100) / 100;
    const posX = appSettings.customBgPosX ?? 50;
    const posY = appSettings.customBgPosY ?? 50;
    const blur = appSettings.customBgBlur || 0;

    bgImg.style.transform = `scale(${scale})`;
    bgImg.style.objectPosition = `${posX}% ${posY}%`;
    bgImg.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';

    // Update UI badge displays
    const scaleBadge = document.getElementById('photo-scale-value');
    const blurBadge = document.getElementById('photo-blur-value');
    const posXBadge = document.getElementById('photo-posx-value');
    const posYBadge = document.getElementById('photo-posy-value');

    if (scaleBadge) scaleBadge.innerText = `${Math.round(scale * 100)}%`;
    if (blurBadge) blurBadge.innerText = `${blur}px`;
    if (posXBadge) posXBadge.innerText = `${posX}%`;
    if (posYBadge) posYBadge.innerText = `${posY}%`;
}

/**
 * Update Photo Tint Overlay
 */
function updatePhotoTint() {
    const bgOverlay = document.getElementById('wallpaper-bg-overlay');
    if (!bgOverlay) return;

    const tintKey = appSettings.customBgTintColor || 'midnight';
    const rgb = TINT_COLORS[tintKey] || TINT_COLORS.midnight;
    const opacity = appSettings.customBgOpacity ?? 0.65;

    bgOverlay.style.background = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;

    // Update tint opacity badge
    const opacityBadge = document.getElementById('photo-opacity-value');
    if (opacityBadge) opacityBadge.innerText = `${Math.round(opacity * 100)}%`;

    // Highlight active tint swatch
    document.querySelectorAll('.tint-color-btn').forEach(btn => {
        if (btn.dataset.tint === tintKey) {
            btn.classList.add('ring-2', 'ring-sky-400');
        } else {
            btn.classList.remove('ring-2', 'ring-sky-400');
        }
    });
}

/**
 * Apply Card Glassmorphism Fine-tuning
 */
function applyCardGlassSettings() {
    const root = document.documentElement;
    const opacity = (appSettings.cardOpacity ?? 72) / 100;
    const blur = appSettings.cardBlur ?? 24;

    root.style.setProperty('--card-opacity', opacity);
    root.style.setProperty('--card-blur', `${blur}px`);

    // Update glow class on cards
    const glow = appSettings.cardGlow || 'default';
    document.querySelectorAll('.day-card').forEach(card => {
        card.classList.remove('glow-cyan', 'glow-violet', 'glow-emerald', 'glow-rose', 'glow-gold', 'glow-crystal');
        if (glow !== 'default') {
            card.classList.add(`glow-${glow}`);
        }
    });

    // Update UI badges
    const cardOpacityBadge = document.getElementById('card-opacity-value');
    const cardBlurBadge = document.getElementById('card-blur-value');
    if (cardOpacityBadge) cardOpacityBadge.innerText = `${Math.round(opacity * 100)}%`;
    if (cardBlurBadge) cardBlurBadge.innerText = `${blur}px`;

    // Highlight active glow button
    document.querySelectorAll('.card-glow-btn').forEach(btn => {
        if (btn.dataset.glow === glow) {
            btn.classList.add('ring-2', 'ring-sky-400');
        } else {
            btn.classList.remove('ring-2', 'ring-sky-400');
        }
    });
}

/**
 * Apply Responsive Preview Scale (75%, 85%, 100%)
 */
function applyPreviewScale(scale) {
    const wrapper = document.querySelector('.phone-wrapper');
    if (!wrapper) return;

    wrapper.classList.remove('scale-75', 'scale-85', 'scale-100');
    wrapper.classList.add(`scale-${scale}`);
    appSettings.previewScale = scale;
    saveToStorage();

    // Update active scale buttons
    document.querySelectorAll('.preview-scale-btn').forEach(btn => {
        if (btn.dataset.scale == scale) {
            btn.classList.add('bg-sky-500/30', 'text-sky-300', 'border-sky-400/40');
            btn.classList.remove('text-slate-400');
        } else {
            btn.classList.remove('bg-sky-500/30', 'text-sky-300', 'border-sky-400/40');
            btn.classList.add('text-slate-400');
        }
    });

    triggerAutoAdjust();
}

/**
 * Interactive Drag to Pan Background Photo
 */
function setupPhotoInteractiveDrag() {
    const area = document.getElementById('wallpaper-area');
    if (!area) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialPosX = 50;
    let initialPosY = 50;

    const onStart = (e) => {
        if (!appSettings.customBg) return;
        // Ignore clicks on class rows so editing still works smoothly
        if (e.target.closest('.class-row') || e.target.closest('.day-title')) return;

        isDragging = true;
        area.classList.add('is-dragging');
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        startX = clientX;
        startY = clientY;
        initialPosX = appSettings.customBgPosX ?? 50;
        initialPosY = appSettings.customBgPosY ?? 50;
    };

    const onMove = (e) => {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        // Sensitivity factor (inverted for natural touch pan)
        const newX = Math.max(0, Math.min(100, Math.round(initialPosX - (deltaX * 0.3))));
        const newY = Math.max(0, Math.min(100, Math.round(initialPosY - (deltaY * 0.25))));

        appSettings.customBgPosX = newX;
        appSettings.customBgPosY = newY;

        updatePhotoTransform();

        // Update slider positions
        const sliderX = document.getElementById('customBgPosX');
        const sliderY = document.getElementById('customBgPosY');
        if (sliderX) sliderX.value = newX;
        if (sliderY) sliderY.value = newY;
    };

    const onEnd = () => {
        if (isDragging) {
            isDragging = false;
            area.classList.remove('is-dragging');
            saveToStorage();
        }
    };

    area.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    area.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
