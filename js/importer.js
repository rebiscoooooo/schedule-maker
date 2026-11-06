/**
 * Smart Importer: PDF, Image OCR, and Text Regex Parser
 * Lock Screen Schedule Maker
 */

// Initialize PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
}

/**
 * Handle Image OCR Upload using Tesseract.js with real-time progress
 */
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const progressModal = document.getElementById('ocr-progress-container');
    const progressBar = document.getElementById('ocr-progress-bar');
    const progressStatus = document.getElementById('ocr-progress-status');

    if (progressModal) progressModal.classList.remove('hidden');
    if (progressBar) progressBar.style.width = '10%';
    if (progressStatus) progressStatus.innerText = 'Initializing OCR engine...';

    try {
        const worker = await Tesseract.createWorker('eng', 1, {
            logger: m => {
                if (m.status === 'recognizing text' && m.progress) {
                    const pct = Math.round(m.progress * 100);
                    if (progressBar) progressBar.style.width = `${pct}%`;
                    if (progressStatus) progressStatus.innerText = `Recognizing text: ${pct}%`;
                } else if (m.status) {
                    if (progressStatus) progressStatus.innerText = m.status.charAt(0).toUpperCase() + m.status.slice(1);
                }
            }
        });

        const ret = await worker.recognize(file);
        await worker.terminate();

        const extractedText = ret.data.text;
        const formInput = document.getElementById('form6Input');
        if (formInput) formInput.value = extractedText;

        const count = parseScheduleText(extractedText);
        showToast(`Image scanned! Imported ${count} subjects.`, 'success');
    } catch (error) {
        console.error("Image OCR Error: ", error);
        showToast("Couldn't read text clearly from this image. Please ensure good lighting.", 'danger');
    } finally {
        if (progressModal) progressModal.classList.add('hidden');
        event.target.value = '';
    }
}

/**
 * Handle PDF Upload using PDF.js
 */
async function handlePDFUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const progressModal = document.getElementById('ocr-progress-container');
    const progressBar = document.getElementById('ocr-progress-bar');
    const progressStatus = document.getElementById('ocr-progress-status');

    if (progressModal) progressModal.classList.remove('hidden');
    if (progressBar) progressBar.style.width = '30%';
    if (progressStatus) progressStatus.innerText = 'Extracting pages from PDF...';

    const reader = new FileReader();
    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                if (progressBar) progressBar.style.width = `${Math.round((i / pdf.numPages) * 90)}%`;
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

            const formInput = document.getElementById('form6Input');
            if (formInput) formInput.value = fullText;

            const count = parseScheduleText(fullText);
            showToast(`PDF parsed! Imported ${count} subjects.`, 'success');
        } catch (error) {
            console.error("PDF Parsing Error: ", error);
            showToast("Failed to parse this PDF document.", 'danger');
        } finally {
            if (progressModal) progressModal.classList.add('hidden');
            event.target.value = '';
        }
    };
    reader.readAsArrayBuffer(file);
}

/**
 * Helper to identify days of week from schedule abbreviations
 */
function getDaysFromString(str) {
    let d = new Set();
    let s = str.toUpperCase();

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
 */
function parseScheduleText(text) {
    if (!text || !text.trim()) return 0;
    const lines = text.split('\n');
    let currentContextDays = [];
    let addedCount = 0;

    lines.forEach(line => {
        if (!line.trim()) return;
        let cleanLine = line.replace(/\s{2,}/g, ' ').trim();

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

        let inlineDays = getDaysFromString(remainingLine);
        let activeDays = inlineDays.length > 0 ? inlineDays : currentContextDays;
        if (activeDays.length === 0) return;

        // Clean day acronyms from the remaining text
        remainingLine = remainingLine
            .replace(/\b(M_W_|T_TH_|T_F_|M_|T_|W_|TH_|F_|S_|MWF|TTH|M|T|W|TH|F|S)\b/ig, '')
            .replace(/_/g, '')
            .replace(/^\d+\s+/, '').replace(/\s+\d+$/, '').trim();

        // Match subject code and room name
        const subjRoomRegex = /^([A-Z-]+\s*\d+(?:\s+LAB\s*[A-Z]?)?)\s*(.*)$/i;
        let match = remainingLine.match(subjRoomRegex);
        let subject = "SUBJECT", room = "TBA";

        if (match) {
            subject = match[1].trim();
            room = match[2].trim() || "TBA";
        } else {
            let parts = remainingLine.split(' ');
            if (parts.length > 1) {
                room = parts.pop();
                subject = parts.join(' ');
            } else {
                subject = remainingLine || "SUBJECT";
            }
        }

        activeDays.forEach(day => {
            if (addClassToData(day, time, subject, room)) {
                addedCount++;
            }
        });
    });

    renderAllDays();
    renderScheduleManagementTable();
    return addedCount;
}

