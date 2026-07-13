import type { jsPDF } from 'jspdf';

import { createCdphDocument } from './cdph-form-layout';
import type { Cdph283BPdfData } from '../types/cdph-pdf.types';

/**
 * Page-for-page replica of the official CDPH 283 B (01/22) paper form.
 * Coordinates are in mm on US Letter (215.9 x 279.4).
 */

const M = 10;
const PAGE_W = 215.9;
const RIGHT = PAGE_W - M;
const FOOTER_Y = 270;

function drawFooter(doc: jsPDF, page: number): void {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('CDPH 283 B (01/22)', M, FOOTER_Y);
  doc.text('This form is available on our website at:  www.cdph.ca.gov', PAGE_W / 2, FOOTER_Y, { align: 'center' });
  doc.text(`Page ${page} of 3`, RIGHT, FOOTER_Y, { align: 'right' });
}

function drawSectionBar(doc: jsPDF, y: number, label: string): number {
  doc.setFillColor(200, 200, 200);
  doc.rect(M, y, RIGHT - M, 6.5, 'F');
  doc.setDrawColor(0);
  doc.rect(M, y, RIGHT - M, 6.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(label, M + 2, y + 4.6);
  return y + 6.5;
}

function drawRadio(doc: jsPDF, x: number, y: number, selected: boolean): void {
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.circle(x, y, 1.6);
  if (selected) {
    doc.setFillColor(0, 0, 0);
    doc.circle(x, y, 0.9, 'F');
  }
}

function drawCheckbox(doc: jsPDF, x: number, y: number, checked: boolean): void {
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(x, y - 2.4, 3, 3);
  if (checked) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('X', x + 0.7, y);
  }
}

/** Bordered form cell with a small label in the top-left corner and the filled value beneath it. */
function drawCell(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  options?: { italicLabel?: boolean; labelSize?: number },
): void {
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.rect(x, y, w, h);
  doc.setFont('helvetica', options?.italicLabel ? 'italic' : 'normal');
  doc.setFontSize(options?.labelSize ?? 7.5);
  const labelLines = doc.splitTextToSize(label, w - 3);
  doc.text(labelLines, x + 1.5, y + 3.2);
  if (value) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const labelHeight = labelLines.length * 2.9;
    doc.text(doc.splitTextToSize(value, w - 3), x + 1.5, y + labelHeight + 5.5);
  }
}

/** Value printed over a fill-in underline, like handwriting on the paper form's blank. */
function drawUnderlinedValue(doc: jsPDF, x: number, y: number, w: number, value: string): void {
  if (value) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(value, x + 1, y - 1);
  }
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(x, y, x + w, y);
}

function drawPage1(doc: jsPDF, data: Cdph283BPdfData): void {
  // Agency line + mail/fax block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('State of California- Health and Human Services Agency', M, 14);

  const mailX = 128;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('MAIL OR FAX APPLICATION TO:', mailX, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  [
    'California Department of Public Health (CDPH)',
    'Licensing and Certification Division (L&C)',
    'Healthcare Workforce Branch (HWB)',
    'MS 3301, P.O. Box 997416',
    'Sacramento, CA 95899-7416',
    'PHONE: (916) 327-2445  FAX: (916) 552-8785',
  ].forEach((line, index) => {
    doc.text(line, mailX, 15.5 + index * 3.4);
  });

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CERTIFIED NURSE ASSISTANT (CNA)', PAGE_W / 2, 44, { align: 'center' });
  doc.text('INITIAL APPLICATION', PAGE_W / 2, 50.5, { align: 'center' });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('(See instructions on the reverse)', PAGE_W / 2, 55.5, { align: 'center' });

  // SECTION I
  let y = drawSectionBar(doc, 60, 'SECTION I (REQUIRED)');
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('TYPE OF REQUEST', M, y);
  y += 5.5;

  drawRadio(doc, M + 2.5, y - 1, data.requestType === 'enrollment');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Check here if you are enrolling in a ', M + 6, y);
  doc.setFont('helvetica', 'bold');
  doc.text('CNA', M + 6 + doc.getTextWidth('Check here if you are enrolling in a '), y);
  doc.setFont('helvetica', 'normal');
  doc.text(' training program ', M + 6 + doc.getTextWidth('Check here if you are enrolling in a CNA'), y);
  doc.setFont('helvetica', 'bold');
  doc.text(
    '(complete sections I, II, III, IV, and V)',
    M + 6 + doc.getTextWidth('Check here if you are enrolling in a CNA training program '),
    y,
  );
  y += 5;

  drawRadio(doc, M + 2.5, y - 1, data.requestType === 'reconsideration');
  doc.setFont('helvetica', 'normal');
  doc.text('Check here if you are requesting ', M + 6, y);
  doc.setFont('helvetica', 'bold');
  doc.text('RECONSIDERATION', M + 6 + doc.getTextWidth('Check here if you are requesting '), y);
  doc.setFont('helvetica', 'normal');
  doc.text(
    ' for a ',
    M + 6 + doc.getTextWidth('Check here if you are requesting RECONSIDERATION'),
    y,
  );
  doc.setFont('helvetica', 'bold');
  doc.text(
    'previously revoked/denied',
    M + 6 + doc.getTextWidth('Check here if you are requesting RECONSIDERATION for a '),
    y,
  );
  doc.setFont('helvetica', 'normal');
  doc.text(
    ' certificate',
    M + 6 + doc.getTextWidth('Check here if you are requesting RECONSIDERATION for a previously revoked/denied'),
    y,
  );
  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.text('(complete sections I, II, III and V)', M + 10, y);
  y += 6;

  // SECTION II
  y = drawSectionBar(doc, y, 'SECTION II (REQUIRED)');

  // Row 1: Last Name | First Name | MI | Sex
  const row1H = 15;
  drawCell(doc, M, y, 92, row1H, 'Last Name', data.lastName);
  drawCell(doc, M + 92, y, 55, row1H, 'First Name', data.firstName);
  drawCell(doc, M + 147, y, 17, row1H, 'MI', data.middleInitial);
  // Sex cell drawn manually so the radio circles match the official layout
  doc.rect(M + 164, y, RIGHT - (M + 164), row1H);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Sex', M + 165.5, y + 3.2);
  drawRadio(doc, M + 167.5, y + 7, data.sex === 'Male');
  doc.setFontSize(8.5);
  doc.text('Male', M + 171, y + 8);
  drawRadio(doc, M + 167.5, y + 12, data.sex === 'Female');
  doc.text('Female', M + 171, y + 13);
  y += row1H;

  // Row 2: Public Address | City | State | Zip
  const row2H = 17;
  drawCell(
    doc,
    M,
    y,
    102,
    row2H,
    'Public Address (Required) – Subject to Public Records Act Request release*',
    data.addressLine1,
    { italicLabel: true },
  );
  drawCell(doc, M + 102, y, 45, row2H, 'City', data.city);
  drawCell(doc, M + 147, y, 22, row2H, 'State', data.state);
  drawCell(doc, M + 169, y, RIGHT - (M + 169), row2H, 'Zip Code', data.zip);
  y += row2H;

  // Row 3: Confidential Address | City | State | Zip
  const row3H = 17;
  drawCell(
    doc,
    M,
    y,
    102,
    row3H,
    'Confidential Address (Required)- (For CDPH Use only. If left blank all departmental mail will be sent to the address above)',
    data.confidentialAddressLine1,
    { italicLabel: true, labelSize: 6.8 },
  );
  drawCell(doc, M + 102, y, 45, row3H, 'City', data.confidentialCity, { italicLabel: true });
  drawCell(doc, M + 147, y, 22, row3H, 'State', data.confidentialState, { italicLabel: true });
  drawCell(doc, M + 169, y, RIGHT - (M + 169), row3H, 'Zip Code', data.confidentialZip, { italicLabel: true });
  y += row3H;

  // Row 4: Date of Birth | SSN/ITIN | Driver's License
  const row4H = 24;
  drawCell(doc, M, y, 28, row4H, 'Date of Birth', data.dob, { italicLabel: true });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.text('(mm/dd/yy)', M + 1.5, y + row4H - 2);

  doc.rect(M + 28, y, 92, row4H);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('Social Security Number (SSN) or Individual', M + 30, y + 4);
  doc.text('Taxpayer Identification Number (ITIN)', M + 30, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const ssnValue = data.ssn || data.itin;
  if (ssnValue) {
    doc.text(ssnValue, M + 30, y + 14);
  } else {
    doc.text('___ ___ ___ - ___ ___ - ___ ___ ___ ___', M + 30, y + 14);
  }
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.8);
  doc.text('**If you use an invalid SSN, your application process may be delayed', M + 30, y + row4H - 2.5);

  doc.rect(M + 120, y, RIGHT - (M + 120), row4H);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text("Driver's License /State ID Number", M + 122, y + 4);
  doc.setFont('helvetica', 'italic');
  doc.text('Number:', M + 122, y + 10.5);
  drawUnderlinedValue(doc, M + 138, y + 11, RIGHT - (M + 140), data.driversLicenseNumber);
  doc.setFont('helvetica', 'italic');
  doc.text('State:', M + 122, y + 18);
  drawUnderlinedValue(doc, M + 138, y + 18.5, RIGHT - (M + 140), data.driversLicenseState);
  y += row4H;

  // Row 5: Phone + text consent | Email
  const row5H = 38;
  doc.rect(M, y, 110, row5H);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Phone Number ***', M + 1.5, y + 4);
  drawUnderlinedValue(doc, M + 32, y + 4.5, 70, data.phone);
  drawCheckbox(doc, M + 2, y + 10.5, data.textMessageConsent);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  const consentText = doc.splitTextToSize(
    'By checking this box, you agree to receive text messages from the California Department of Public Health (CDPH) for ' +
      'reminders and notifications regarding your application and/or certification. You may receive up to 5 messages per month. ' +
      'Message and data rates may apply. By checking this box, you agree to the Terms and Conditions and Privacy Policy. ' +
      'Reply "STOP" to opt-out, and "HELP" for help.',
    103,
  );
  doc.text(consentText, M + 6.5, y + 10.5);

  doc.rect(M + 110, y, RIGHT - (M + 110), row5H);
  doc.setFontSize(8);
  doc.text('Email Address***', M + 112, y + 4);
  drawUnderlinedValue(doc, M + 112, y + 14, RIGHT - (M + 114), data.email);

  drawFooter(doc, 1);
}

function drawPage2(doc: jsPDF, data: Cdph283BPdfData): void {
  doc.addPage();
  let y = drawSectionBar(doc, 14, 'SECTION III (REQUIRED)');
  y += 5;

  // Question 1 — conviction
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('1)  Have you been ', M + 2, y);
  doc.setFont('helvetica', 'bold');
  doc.text('CONVICTED', M + 2 + doc.getTextWidth('1)  Have you been '), y);
  doc.setFont('helvetica', 'normal');
  doc.text(
    ', at any time, of any crime, other than a minor traffic violation?  (You',
    M + 2 + doc.getTextWidth('1)  Have you been CONVICTED'),
    y,
  );
  y += 4.2;
  doc.text('need not disclose any marijuana-related offenses specified in the marijuana reform legislation and', M + 8, y);
  y += 4.2;
  doc.text('codified at the Health and Safety Code, Sections 11361.5 and 11361.7).', M + 8, y);
  y += 5.5;
  drawRadio(doc, M + 10, y - 1, data.conviction);
  doc.text('Yes', M + 13.5, y);
  drawRadio(doc, M + 28, y - 1, !data.conviction);
  doc.text('No', M + 31.5, y);
  y += 5.5;
  doc.text('If yes, list conviction:', M + 8, y);
  drawUnderlinedValue(doc, M + 42, y + 0.5, 110, data.conviction ? data.convictionDescription : '');
  y += 5.5;
  doc.text('Court of conviction:', M + 8, y);
  drawUnderlinedValue(doc, M + 40, y + 0.5, 62, data.conviction ? data.convictionCourt : '');
  doc.text('Date:', M + 106, y);
  drawUnderlinedValue(doc, M + 116, y + 0.5, 48, data.conviction ? data.convictionDate : '');
  y += 6.5;

  // Question 2 — adverse action
  doc.text('2)  Has any health-related licensing, certification or disciplinary authority taken adverse action', M + 2, y);
  y += 4.2;
  doc.text('(revoked, annulled, cancelled, suspended, etc.) against you?', M + 8, y);
  y += 5.5;
  drawRadio(doc, M + 10, y - 1, data.adverseAction);
  doc.text('Yes', M + 13.5, y);
  drawRadio(doc, M + 28, y - 1, !data.adverseAction);
  doc.text('No', M + 31.5, y);
  y += 5.5;
  doc.text('Type of License/Certificate:', M + 8, y);
  drawUnderlinedValue(doc, M + 52, y + 0.5, 55, data.adverseAction ? data.adverseActionLicenseType : '');
  y += 5.5;
  doc.text('License/Certificate Number:', M + 8, y);
  drawUnderlinedValue(doc, M + 52, y + 0.5, 55, data.adverseAction ? data.adverseActionLicenseNumber : '');
  y += 5.5;
  doc.text('Type of Action:', M + 8, y);
  drawUnderlinedValue(doc, M + 34, y + 0.5, 45, data.adverseAction ? data.adverseActionType : '');
  y += 7;

  // SECTION IV
  y = drawSectionBar(doc, y, 'SECTION IV (IF APPLICABLE)');
  const r1H = 13;
  drawCell(doc, M, y, 132, r1H, 'Name of school or facility where you received/will receive the CNA training', data.trainingProgramName);
  drawCell(doc, M + 132, y, RIGHT - (M + 132), r1H, 'Telephone Number', data.trainingProgramPhone);
  y += r1H;
  const r2H = 12;
  drawCell(doc, M, y, 90, r2H, 'Mailing Address (Number Street or P.O Box number', data.trainingProgramAddressLine1);
  drawCell(doc, M + 90, y, 48, r2H, 'City', data.trainingProgramCity);
  drawCell(doc, M + 138, y, 25, r2H, 'State', data.trainingProgramState);
  drawCell(doc, M + 163, y, RIGHT - (M + 163), r2H, 'Zip Code', data.trainingProgramZip);
  y += r2H;
  const r3H = 14;
  doc.rect(M, y, 105, r3H);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('California Training Program ID Number for ', M + 1.5, y + 4);
  doc.setFont('helvetica', 'bold');
  doc.text('CNA', M + 1.5 + doc.getTextWidth('California Training Program ID Number for '), y + 4);
  doc.setFont('helvetica', 'normal');
  doc.text('(Required) CNA:', M + 1.5, y + 8);
  drawUnderlinedValue(doc, M + 27, y + 8.5, 70, data.trainingProgramId);
  drawCell(doc, M + 105, y, 46, r3H, 'Beginning Date of Training', data.trainingBeginDate, { italicLabel: false });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.text('(mm/dd/yy)', M + 122, y + r3H - 2);
  drawCell(doc, M + 151, y, RIGHT - (M + 151), r3H, 'End Date of Training', data.trainingEndDate);
  doc.text('(mm/dd/yy)', M + 168, y + r3H - 2);
  y += r3H + 2;

  // SECTION V
  y = drawSectionBar(doc, y, 'SECTION V (REQUIRED)');
  y += 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const certLines = doc.splitTextToSize(
    'I certify under penalty and perjury under the applicable state and federal laws that the information contained in ' +
      'this application and supporting documents, is true and correct. I further understand that any false, incomplete, or ' +
      'incorrect statements may result in denial of this application. I acknowledge that signing this document through ' +
      'electronic means shall have the same legal validity and enforceability as a manually executed signature or use of a ' +
      'paper-based record keeping system to the fullest extent permitted by applicable law.',
    RIGHT - M - 4,
  );
  doc.text(certLines, M + 2, y);
  y += certLines.length * 4.6 + 7;

  const signatureValue = data.signedAt
    ? `${data.firstName} ${data.lastName} (signed electronically)`
    : '';
  const signatureDate = data.signedAt ? new Date(data.signedAt).toLocaleDateString('en-US') : '';
  drawUnderlinedValue(doc, M + 2, y, 95, signatureValue);
  drawUnderlinedValue(doc, M + 140, y, RIGHT - (M + 142), signatureDate);
  y += 4;
  doc.setFontSize(9);
  doc.text('Signature of Applicant', M + 2, y);
  doc.text('Date', M + 140, y);
  y += 4;

  // SECTION VI
  doc.setFillColor(200, 200, 200);
  doc.rect(M, y, RIGHT - M, 10, 'F');
  doc.rect(M, y, RIGHT - M, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('SECTION VI: TO BE COMPLETED BY THE REGISTERED NURSE RESPONSIBLE FOR THE', M + 2, y + 4);
  doc.text('GENERAL SUPERVISION OF THE TRAINING PROGRAM', M + 2, y + 8.2);
  y += 10;

  const rnBoxH = 30;
  doc.rect(M, y, 132, rnBoxH);
  doc.rect(M + 132, y, RIGHT - (M + 132), rnBoxH);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.3);
  const rnLines = doc.splitTextToSize(
    'I certify that this individual has successfully completed state and federal nurse assistant training requirements ' +
      'and is eligible to take the Competency Evaluation (only applies to students that have recently completed a CNA ' +
      'Training Program in CA.',
    128,
  );
  doc.text(rnLines, M + 2, y + 4);
  doc.setFont('helvetica', 'bold');
  doc.text('FOR VENDOR USE ONLY', M + 134, y + 4);

  const rnFieldsY = y + rnLines.length * 3.4 + 6;
  drawUnderlinedValue(doc, M + 2, rnFieldsY, 40, '');
  drawUnderlinedValue(doc, M + 50, rnFieldsY, 55, '');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.3);
  doc.text('Printed Name', M + 2, rnFieldsY + 3.5);
  doc.text('Title', M + 50, rnFieldsY + 3.5);
  drawUnderlinedValue(doc, M + 2, rnFieldsY + 9, 40, '');
  drawUnderlinedValue(doc, M + 50, rnFieldsY + 9, 55, '');
  doc.text('Signature', M + 2, rnFieldsY + 12.5);
  doc.text('Date', M + 50, rnFieldsY + 12.5);

  drawFooter(doc, 2);
}

function drawPage3(doc: jsPDF): void {
  doc.addPage();
  let y = 16;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text('CERTIFED NURSE ASSISTANT (CNA) INITIAL APPLICATION INFORMATION', M, y);
  y += 7;

  const paragraph = (heading: string, lines: string[]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(heading, M, y);
    y += 4.4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.4);
    lines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, RIGHT - M - 4);
      doc.text(wrapped, M + 2, y);
      y += wrapped.length * 3.6 + 1.5;
    });
    y += 1.5;
  };

  paragraph('A) CNA APPLICANTS (complete sections I, II, III, IV, and V)', [
    '1) The applicant must submit the following to HWB upon enrollment in the program and before patient contact:',
    'a) This completed Initial Application (CDPH 283 B); and',
    'b) A copy of the completed Request for Live Scan Services (BCIA 8016) form. Applicants who are unable to obtain ' +
      'electronic prints may complete the fingerprint card (FD-258) and submit two copies to the department. Fingerprint ' +
      'cards (FD-258) must be accompanied by a $32.00 check or money order made payable to "The Department of Justice"',
  ]);

  paragraph('B) CRIMINAL RECORD CLEARANCE', [
    '1) All CNA applicants must undergo a criminal record review. For more information, please visit us at ' +
      'www.cdph.ca.gov/Programs/CHCQ/LCP/Pages/CriminalRecordReview.aspx.',
  ]);

  paragraph('C) CNA RENEWAL INFORMATION', [
    '1) The initial CNA certificate is issued for two birthdays, not two calendar years, and will expire on your birthday. ' +
      'Each year of the certification period will be from one birthday to the following birthday. Any additional time from ' +
      'the effective date until the first birthday will be counted towards the first year of the certification period. CNA ' +
      'certificates must be renewed every two (2) years. You may renew your certificate anytime within two (2) years after ' +
      'the expiration date for more information, please visit us at https://www.cdph.ca.gov/Programs/CHCQ/LCP/Pages/CNA.aspx',
  ]);

  paragraph('D) NAME AND ADDRESS CHANGES', [
    '1) Certificate holders shall notify CDPH within sixty (60) days of any change of address. If requesting a name change, ' +
      'submit legal verification of the change (marriage certificate, divorce decree, or court documents). Failure to report ' +
      'a name or address change may result in the delay or loss of your certification.',
  ]);

  paragraph('E) RECONSIDERATION', [
    "1) If the applicant's CNA certificate was revoked or denied by the CDPH, after review of this application, the CDPH " +
      'will reach out to the applicant for additional information/documentation as needed.',
  ]);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.4);
  const legalBasis = doc.splitTextToSize(
    'Aforementioned requirements are based on Health and Safety Code commencing with §1337 through 1338.5, 1725 through ' +
      '1742 and Code of Federal Regulations Title 42, Chapter IV, commencing with §483.13 and California Code of ' +
      'Regulations, Title 22, commencing with §71801.',
    RIGHT - M - 4,
  );
  doc.text(legalBasis, M + 2, y);
  y += legalBasis.length * 3.6 + 5;

  doc.setLineWidth(0.5);
  doc.line(M, y, RIGHT, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('INFORMATION COLLECTION AND ACCESS-PRIVACY STATEMENT', PAGE_W / 2, y, { align: 'center' });
  y += 5.5;
  doc.setFontSize(8.2);
  const privacy = doc.splitTextToSize(
    '*Pursuant to a court order, the California Department of Public Health will be required to release the address of ' +
      'record for certified nurse assistants, home health aides, certified hemodialysis technicians, and licensed nursing ' +
      'home administrators in response to a Public Records Act (PRA) request. (Government Code starting at section 6250.) ' +
      'Court Order: Service Employees International Union-United Healthcare Workers v. California Department of Public ' +
      'Health, Sacramento County Superior Court, February 21, 2018, No. 34-2017-80002636. **If you use an invalid SSN, ' +
      "your application process may be delayed ***Providing your telephone number and email address is for the California " +
      "Department of Public Health's internal use only for contacting applicants. This information will not be released to " +
      'the public nor will it be displayed online',
    RIGHT - M,
  );
  doc.text(privacy, M, y);
  y += privacy.length * 3.5 + 4;
  doc.line(M, y, RIGHT, y);

  drawFooter(doc, 3);
}

export function renderCdph283B(data: Cdph283BPdfData): Buffer {
  const doc = createCdphDocument();
  drawPage1(doc, data);
  drawPage2(doc, data);
  drawPage3(doc);
  return Buffer.from(doc.output('arraybuffer'));
}
