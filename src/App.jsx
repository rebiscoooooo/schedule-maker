import React from 'react';
import Header from './components/Header';
import ControlPanel from './components/Controls/ControlPanel';
import PhoneToolbar from './components/PhonePreview/PhoneToolbar';
import PhoneMockup from './components/PhonePreview/PhoneMockup';
import Toast from './components/Toast';
import OcrModal from './components/OcrModal';

export default function App() {
  return (
    <>
      {/* Ambient Glowing Orbs Background */}
      <div className="ambient-background" aria-hidden="true">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
        <Header />

        {/* Main Layout: 2 Columns (Controls & Phone Live Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Control Center (7 Cols on LG) */}
          <div className="lg:col-span-7 space-y-6">
            <ControlPanel />
          </div>

          {/* RIGHT COLUMN: Smartphone Live Preview (5 Cols on LG) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <PhoneToolbar />
            <PhoneMockup />
          </div>
        </div>
      </div>

      {/* Live Toast Alert Notification */}
      <Toast />

      {/* OCR / Scanning Loading Modal Overlay */}
      <OcrModal />
    </>
  );
}

