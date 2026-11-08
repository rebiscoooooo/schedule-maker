/**
 * Smart Importer: PDF, Image OCR, and Text Regex Parser
 * Lock Screen Schedule Maker - React Edition
 */

export function getDaysFromString(str) {
  const d = new Set();
  const s = str.toUpperCase();

  if (s.includes('MONDAY') || s.includes('MON') || s.includes('MWF') || s.includes('M_') || s.match(/\bM\b/)) d.add('MONDAY');
  if (s.includes('TUESDAY') || s.includes('TUE') || s.includes('TTH') || s.includes('T_F') || s.includes('T_TH') || s.match(/\bT_\b/) || (s.match(/\bT\b/) && !s.match(/\bTH\b/))) d.add('TUESDAY');
  if (s.includes('WEDNESDAY') || s.includes('WED') || s.includes('MWF') || s.includes('W_') || s.match(/\bW\b/)) d.add('WEDNESDAY');
  if (s.includes('THURSDAY') || s.includes('THUR') || s.includes('THU') || s.includes('TTH') || s.includes('TH_') || s.match(/\bTH\b/)) d.add('THURSDAY');
  if (s.includes('FRIDAY') || s.includes('FRI') || s.includes('MWF') || s.includes('F_') || s.match(/\bF\b/)) d.add('FRIDAY');
  if (s.includes('SATURDAY') || s.includes('SAT') || s.includes('S_') || s.match(/\bS\b/)) d.add('SATURDAY');

  return Array.from(d);
}

/**
 * Robust Regex Parser for COR, Form 6, and pasted schedules
 * Returns an array of { day, time, subject, room } objects.
 */
export function parseScheduleText(text) {
  if (!text || !text.trim()) return [];
  const lines = text.split('\n');
  let currentContextDays = [];
  const results = [];

  lines.forEach(line => {
    if (!line.trim()) return;
    const cleanLine = line.replace(/\s{2,}/g, ' ').trim();

    // Check if header line defines a day (e.g., "MONDAY:", "TUE")
    const dayHeaderRegex = /^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|MON|TUE|WED|THU|THUR|FRI|SAT)S?:?$/i;
    if (cleanLine.match(dayHeaderRegex)) {
      currentContextDays = getDaysFromString(cleanLine);
      return;
    }

    // Detect Time Format: "11:30 - 1:00" or "07:30AM - 09:00AM" or "TBA"
    const timeRegex = /(\d{1,2}:\d{2}\s*(?:AM|PM|A|P)?\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM|A|P)?)/i;
    const timeMatch = cleanLine.match(timeRegex);
    let time = "TBA";
    let remainingLine = cleanLine;

    if (timeMatch) {
      time = timeMatch[0].replace(/\s/g, '');
      remainingLine = cleanLine.replace(timeMatch[0], '').trim();
    } else if (cleanLine.toUpperCase().includes('TBA')) {
      time = "TBA";
      remainingLine = cleanLine.replace(/\bTBA\b/i, '').trim();
    } else {
      return;
    }

    const inlineDays = getDaysFromString(remainingLine);
    const activeDays = inlineDays.length > 0 ? inlineDays : currentContextDays;
    if (activeDays.length === 0) return;

    // Clean day acronyms from the remaining text
    remainingLine = remainingLine
      .replace(/\b(M_W_|T_TH_|T_F_|M_|T_|W_|TH_|F_|S_|MWF|TTH|M|T|W|TH|F|S)\b/ig, '')
      .replace(/_/g, '')
      .replace(/^\d+\s+/, '').replace(/\s+\d+$/, '').trim();

    // Match subject code and room name
    const subjRoomRegex = /^([A-Z-]+\s*\d+(?:\s+LAB\s*[A-Z]?)?)\s*(.*)$/i;
    const match = remainingLine.match(subjRoomRegex);
    let subject = "SUBJECT";
    let room = "TBA";

    if (match) {
      subject = match[1].trim();
      room = match[2].trim() || "TBA";
    } else {
      const parts = remainingLine.split(' ');
      if (parts.length > 1) {
        room = parts.pop();
        subject = parts.join(' ');
      } else {
        subject = remainingLine || "SUBJECT";
      }
    }

    activeDays.forEach(day => {
      results.push({
        day,
        time,
        subject,
        room
      });
    });
  });

  return results;
}

/**
 * Handle Image OCR Upload using Tesseract.js
 */
export async function extractTextFromImage(file, onProgress) {
  if (typeof window.Tesseract === 'undefined') {
    throw new Error('Tesseract.js library not loaded');
  }

  onProgress({ progress: 10, status: 'Initializing OCR engine...' });

  const worker = await window.Tesseract.createWorker('eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text' && m.progress) {
        const pct = Math.round(m.progress * 100);
        onProgress({ progress: pct, status: `Recognizing text: ${pct}%` });
      } else if (m.status) {
        onProgress({ status: m.status.charAt(0).toUpperCase() + m.status.slice(1) });
      }
    }
  });

  const ret = await worker.recognize(file);
  await worker.terminate();
  return ret.data.text;
}

/**
 * Handle PDF Upload using PDF.js
 */
export async function extractTextFromPdf(file, onProgress) {
  if (typeof window.pdfjsLib === 'undefined') {
    throw new Error('PDF.js library not loaded');
  }

  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

  onProgress({ progress: 20, status: 'Reading PDF document...' });

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress({
      progress: Math.round((i / pdf.numPages) * 90),
      status: `Extracting page ${i} of ${pdf.numPages}...`
    });
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    let lastY = -1;
    let line = "";

    content.items.forEach(item => {
      if (lastY !== -1 && Math.abs(lastY - item.transform[5]) > 4) {
        fullText += line + '\n';
        line = "";
      }
      line += item.str + ' ';
      lastY = item.transform[5];
    });
    fullText += line + '\n';
  }

  return fullText;
}

