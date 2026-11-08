import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { DAYS_OF_WEEK, TINT_COLORS } from '../../constants/config';
import WallpaperHeader from './WallpaperHeader';
import DayCard from './DayCard';
import EmptyState from './EmptyState';

export default function PhoneMockup() {
  const { scheduleData, appSettings, updateSettings, totalSubjectCount } = useSchedule();

  const wallpaperAreaRef = useRef(null);
  const contentBodyRef = useRef(null);
  const cardsContainerRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialX: 50, initialY: 50 });

  // Auto-fit cards-container scale inside content-body
  const triggerAutoAdjust = useCallback(() => {
    if (!contentBodyRef.current || !cardsContainerRef.current) return;
    const cardsEl = cardsContainerRef.current;
    const bodyEl = contentBodyRef.current;

    cardsEl.style.transform = 'scale(1)';

    const timer = setTimeout(() => {
      const availableHeight = bodyEl.clientHeight;
      const contentHeight = cardsEl.scrollHeight;

      if (contentHeight > availableHeight && availableHeight > 0) {
        const scaleRatio = (availableHeight / contentHeight) * 0.96;
        cardsEl.style.transform = `scale(${scaleRatio})`;
      } else {
        cardsEl.style.transform = 'scale(1)';
      }
    }, 20);

    return () => clearTimeout(timer);
  }, []);

  // Run auto-adjust when schedule, header, or preview changes
  useEffect(() => {
    triggerAutoAdjust();
  }, [scheduleData, appSettings.headerClass, appSettings.headerSchedule, appSettings.headerSemester, appSettings.previewScale, triggerAutoAdjust]);

  useEffect(() => {
    window.addEventListener('resize', triggerAutoAdjust);
    return () => window.removeEventListener('resize', triggerAutoAdjust);
  }, [triggerAutoAdjust]);

  // Drag to pan custom background photo
  const handleDragStart = (e) => {
    if (!appSettings.customBg) return;
    if (e.target.closest('.class-row') || e.target.closest('.day-title')) return;

    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragStartRef.current = {
      x: clientX,
      y: clientY,
      initialX: appSettings.customBgPosX ?? 50,
      initialY: appSettings.customBgPosY ?? 50,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleDragMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragStartRef.current.x;
      const deltaY = clientY - dragStartRef.current.y;

      const newX = Math.max(0, Math.min(100, Math.round(dragStartRef.current.initialX - deltaX * 0.3)));
      const newY = Math.max(0, Math.min(100, Math.round(dragStartRef.current.initialY - deltaY * 0.25)));

      updateSettings({ customBgPosX: newX, customBgPosY: newY });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove, { passive: true });
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, updateSettings]);

  // Compute Custom Photo Styles
  const photoScale = (appSettings.customBgScale || 100) / 100;
  const photoPosX = appSettings.customBgPosX ?? 50;
  const photoPosY = appSettings.customBgPosY ?? 50;
  const photoBlur = appSettings.customBgBlur || 0;

  // Compute Tint Overlay Styles
  const tintKey = appSettings.customBgTintColor || 'midnight';
  const rgb = TINT_COLORS[tintKey] || TINT_COLORS.midnight;
  const tintOpacity = appSettings.customBgOpacity ?? 0.65;
  const tintBackground = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${tintOpacity})`;

  const scaleClass = `scale-${appSettings.previewScale || 100}`;
  const themeClass = `theme-${appSettings.theme || 'obsidian'}`;
  const draggableClass = appSettings.customBg ? 'is-draggable' : '';
  const draggingClass = isDragging ? 'is-dragging' : '';

  return (
    <div className={`phone-wrapper ${scaleClass}`}>
      <div className="phone-mockup">
        {/* Dynamic Island / Hardware Notch */}
        <div className="phone-notch">
          <div className="notch-sensor"></div>
          <div className="notch-camera"></div>
        </div>

        {/* Safe Area Clock Overlay */}
        <div
          id="lockscreen-overlay"
          className={`lockscreen-overlay ${!appSettings.showClockOverlay ? 'hidden-overlay' : ''}`}
        >
          <div className="status-bar-preview">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <i className="fa-solid fa-signal text-[9px]"></i>
              <i className="fa-solid fa-wifi text-[9px]"></i>
              <i className="fa-solid fa-battery-full text-xs"></i>
            </div>
          </div>
          <div className="clock-preview">
            <div className="clock-time">09:41</div>
            <div className="clock-date">Thursday, November 6</div>
          </div>
        </div>

        {/* EXPORT ROOT: Phone Wallpaper Canvas */}
        <div
          id="wallpaper-area"
          ref={wallpaperAreaRef}
          className={`${themeClass} ${draggableClass} ${draggingClass}`}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {/* Custom Background Photo */}
          {appSettings.customBg && (
            <div id="wallpaper-photo-container" className="wallpaper-photo-container" style={{ display: 'block' }}>
              <div
                id="wallpaper-custom-bg"
                className="wallpaper-bg-image"
                style={{
                  backgroundImage: `url(${appSettings.customBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: `${photoPosX}% ${photoPosY}%`,
                  backgroundRepeat: 'no-repeat',
                  transform: `scale(${photoScale})`,
                  transformOrigin: 'center center',
                  filter: photoBlur > 0 ? `blur(${photoBlur}px)` : 'none',
                }}
              />
            </div>
          )}

          {/* Photo Tint Overlay */}
          {appSettings.customBg && (
            <div
              id="wallpaper-bg-overlay"
              className="wallpaper-bg-overlay"
              style={{ display: 'block', background: tintBackground }}
            ></div>
          )}

          {/* Lock Screen Schedule Header */}
          <WallpaperHeader />

          {/* Content Body with Class Cards */}
          <div ref={contentBodyRef} className="content-body">
            <div ref={cardsContainerRef} className="cards-container">
              {totalSubjectCount === 0 && <EmptyState />}
              {DAYS_OF_WEEK.map((day) => (
                <DayCard key={day} day={day} items={scheduleData[day] || []} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

