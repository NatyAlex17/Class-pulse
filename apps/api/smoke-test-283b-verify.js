const fs = require('fs');
const zlib = require('zlib');

const raw = fs.readFileSync('smoke-test-283b-output.pdf');
const text = raw.toString('latin1');

// Pull every Flate stream and inflate it
const pages = [];
const streamRegex = /stream\r?\n/g;
let match;
while ((match = streamRegex.exec(text)) !== null) {
  const start = match.index + match[0].length;
  const end = text.indexOf('endstream', start);
  if (end < 0) continue;
  const chunk = raw.subarray(start, end);
  try {
    const inflated = zlib.inflateSync(chunk).toString('latin1');
    if (inflated.includes('Tj') || inflated.includes('TJ')) pages.push(inflated);
  } catch {
    /* not a flate stream */
  }
}

console.log('content streams found:', pages.length);

const expectations = [
  [1, ['CERTIFIED NURSE ASSISTANT (CNA)', 'SECTION I (REQUIRED)', 'SECTION II (REQUIRED)', 'MAIL OR FAX APPLICATION TO:', 'Singh', 'Amara', 'Female', '221 Baker St', 'Page 1 of 3']],
  [2, ['SECTION III (REQUIRED)', 'CONVICTED', 'SECTION IV (IF APPLICABLE)', 'SECTION V (REQUIRED)', 'SECTION VI', 'FOR VENDOR USE ONLY', 'Fall CNA Cohort 2026', 'signed electronically', 'Page 2 of 3']],
  [3, ['INITIAL APPLICATION INFORMATION', 'CRIMINAL RECORD CLEARANCE', 'RECONSIDERATION', 'PRIVACY STATEMENT', 'Page 3 of 3']],
];

for (const [pageNum, markers] of expectations) {
  const stream = pages[pageNum - 1] ?? '';
  for (const marker of markers) {
    // jsPDF may escape parens; normalize
    const found = stream.replace(/\\([()])/g, '$1').includes(marker);
    console.log(`page ${pageNum}: ${found ? 'OK  ' : 'MISS'} ${marker}`);
  }
}
