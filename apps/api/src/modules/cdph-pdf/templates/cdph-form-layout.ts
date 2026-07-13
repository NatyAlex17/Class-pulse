import { jsPDF } from 'jspdf';

export const CDPH_MARGIN = 10;

export interface CdphFieldEntry {
  label: string;
  value: string;
}

/** Every CDPH form is published as a US Letter page. */
export function createCdphDocument(): jsPDF {
  return new jsPDF({ unit: 'mm', format: 'letter' });
}

/** Draws the centered form title (and optional subtitle) with a divider beneath it. Returns the next usable Y position. */
export function drawCdphTitleBlock(doc: jsPDF, title: string, subtitle?: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let cursorY = 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title, pageWidth / 2, cursorY, { align: 'center' });

  if (subtitle) {
    cursorY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(subtitle, pageWidth / 2, cursorY, { align: 'center' });
  }

  cursorY += 5;
  doc.setLineWidth(0.4);
  doc.line(CDPH_MARGIN, cursorY, pageWidth - CDPH_MARGIN, cursorY);

  return cursorY + 6;
}

/** Draws a section heading (e.g. "SECTION II"). Returns the next usable Y position. */
export function drawCdphSectionHeading(doc: jsPDF, y: number, heading: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setFillColor(230, 230, 230);
  doc.rect(CDPH_MARGIN, y - 4, pageWidth - CDPH_MARGIN * 2, 6, 'F');
  doc.text(heading, CDPH_MARGIN + 2, y);
  return y + 8;
}

/**
 * Draws an evenly-spaced row of label/value fields bordered like a paper form's fill-in boxes.
 * Returns the next usable Y position.
 */
export function drawCdphFieldRow(doc: jsPDF, y: number, fields: CdphFieldEntry[]): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - CDPH_MARGIN * 2;
  const colWidth = usableWidth / fields.length;
  const rowTop = y - 5;
  const rowBottom = y + 3;

  doc.setFontSize(7.5);
  fields.forEach((field, index) => {
    const x = CDPH_MARGIN + index * colWidth + 2;
    doc.setFont('helvetica', 'bold');
    doc.text(field.label, x, y - 1.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(field.value || '-', x, y + 3);
    doc.setFontSize(7.5);
  });

  doc.setLineWidth(0.2);
  doc.rect(CDPH_MARGIN, rowTop, usableWidth, rowBottom - rowTop);
  for (let i = 1; i < fields.length; i += 1) {
    const x = CDPH_MARGIN + i * colWidth;
    doc.line(x, rowTop, x, rowBottom);
  }

  return rowBottom + 7;
}

/** Draws a signature/date pair used to close out a form section. Returns the next usable Y position. */
export function drawCdphSignatureBlock(doc: jsPDF, y: number, signatureLabel: string, dateLabel: string): number {
  return drawCdphFieldRow(doc, y, [
    { label: signatureLabel, value: '' },
    { label: dateLabel, value: '' },
  ]);
}

/** Stamps the CDPH legal footer + form code + page numbers on every page of the document. */
export function drawCdphFooter(doc: jsPDF, legalText: string, formCode: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setLineWidth(0.3);
    doc.line(CDPH_MARGIN, pageHeight - 18, pageWidth - CDPH_MARGIN, pageHeight - 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const wrapped = doc.splitTextToSize(legalText, pageWidth - CDPH_MARGIN * 2);
    doc.text(wrapped, CDPH_MARGIN, pageHeight - 14);

    doc.text(formCode, CDPH_MARGIN, pageHeight - 6);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - CDPH_MARGIN, pageHeight - 6, { align: 'right' });
  }
}
