import React, { useState } from 'react';
import { useSchedule } from '../../context/ScheduleContext';
import { parseScheduleText, extractTextFromPdf, extractTextFromImage } from '../../utils/importer';

export default function SmartImportTab() {
  const { importClasses, setOcrModal, showToast } = useSchedule();
  const [rawText, setRawText] = useState('');

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrModal({ visible: true, progress: 20, status: 'Extracting pages from PDF...' });

    try {
      const fullText = await extractTextFromPdf(file, ({ progress, status }) => {
        setOcrModal((prev) => ({ ...prev, progress, status }));
      });

      setRawText(fullText);
      const parsedItems = parseScheduleText(fullText);
      const count = importClasses(parsedItems);

      showToast(`PDF parsed! Imported ${count} subjects.`, 'success');
    } catch (err) {
      console.error('PDF Parsing Error:', err);
      showToast('Failed to parse this PDF document.', 'danger');
    } finally {
      setOcrModal({ visible: false, progress: 0, status: '' });
      e.target.value = '';
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrModal({ visible: true, progress: 10, status: 'Initializing OCR engine...' });

    try {
      const fullText = await extractTextFromImage(file, ({ progress, status }) => {
        setOcrModal((prev) => ({ ...prev, ...(progress ? { progress } : {}), ...(status ? { status } : {}) }));
      });

      setRawText(fullText);
      const parsedItems = parseScheduleText(fullText);
      const count = importClasses(parsedItems);

      showToast(`Image scanned! Imported ${count} subjects.`, 'success');
    } catch (err) {
      console.error('Image OCR Error:', err);
      showToast("Couldn't read text clearly from this image. Please ensure good lighting.", 'danger');
    } finally {
      setOcrModal({ visible: false, progress: 0, status: '' });
      e.target.value = '';
    }
  };

  const handleTextImport = () => {
    if (!rawText || !rawText.trim()) {
      showToast('Please paste your schedule text first.', 'warning');
      return;
    }

    const parsedItems = parseScheduleText(rawText);
    const count = importClasses(parsedItems);

    if (count > 0) {
      showToast(`Successfully imported ${count} classes!`, 'success');
    } else {
      showToast('No valid subjects recognized in text.', 'warning');
    }
  };

  return (
    <div id="tab-import" className="tab-content-panel space-y-5">
      <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-400/20 text-xs text-sky-200 flex items-start gap-3">
        <i className="fa-solid fa-circle-info text-sky-400 text-sm mt-0.5"></i>
        <div>
          <strong>Smart OCR & PDF Engine:</strong> Upload your Certificate of Registration (COR),
          student enrollment form, or photo of your schedule. The system will automatically detect
          days, times, and subject codes!
        </div>
      </div>

      {/* Upload Triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <label className="dropzone-box flex flex-col items-center justify-center group">
          <i className="fa-solid fa-file-pdf text-3xl text-rose-400 group-hover:scale-110 transition-transform mb-2"></i>
          <span className="text-xs font-bold text-white">Upload COR / PDF</span>
          <span className="text-[11px] text-slate-400 mt-0.5">Multi-page PDF parsing</span>
          <input
            type="file"
            id="pdfUpload"
            accept="application/pdf"
            className="hidden"
            onChange={handlePdfUpload}
          />
        </label>

        <label className="dropzone-box flex flex-col items-center justify-center group">
          <i className="fa-solid fa-camera text-3xl text-emerald-400 group-hover:scale-110 transition-transform mb-2"></i>
          <span className="text-xs font-bold text-white">Scan Image / Photo</span>
          <span className="text-[11px] text-slate-400 mt-0.5">AI OCR (PNG, JPG)</span>
          <input
            type="file"
            id="imgUpload"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {/* Text Area Paste */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="form6Input" className="text-xs font-semibold text-slate-300">
            Or Paste Schedule Text Directly:
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            Format: [Day]: [Time] [Subject] [Room]
          </span>
        </div>
        <textarea
          id="form6Input"
          rows={5}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          className="glass-input font-mono text-xs uppercase"
          placeholder={`MONDAY:
11:30 - 1:00 INTECH 3100 IT LEC 203
TUESDAY:
10:00 - 12:00 STAT 3206 IT LEC 204
WEDNESDAY:
1:00 - 4:00 CS 3101 CISCO LAB`}
        />
        <button
          type="button"
          id="importTextBtn"
          onClick={handleTextImport}
          className="glass-btn glass-btn-secondary w-full mt-2.5 text-xs py-2.5"
        >
          <i className="fa-solid fa-file-import text-sky-400"></i>
          <span>Parse & Import Text Schedule</span>
        </button>
      </div>
    </div>
  );
}

