import { Injectable } from '@nestjs/common';
import autoTable from 'jspdf-autotable';

import {
  CDPH_MARGIN,
  createCdphDocument,
  drawCdphFieldRow,
  drawCdphFooter,
  drawCdphSectionHeading,
  drawCdphTitleBlock,
} from '../templates/cdph-form-layout';
import { renderCdph283B } from '../templates/cdph-283b.template';
import type { Cdph283BPdfData, CdphE276PdfData, CdphE276CPdfData, CdphE276APdfData } from '../types/cdph-pdf.types';

const CDPH_E276_FORM_CODE = 'CDPH E276 (04/22)';
const CDPH_E276_LEGAL_FOOTER =
  'This form is available at the eLearning Review Unit website. Submit completed form to the eLearning Review Unit at eLearning@cdph.ca.gov.';

const CDPH_E276C_FORM_CODE = 'CDPH E276C (12/19)';
const CDPH_E276C_LEGAL_FOOTER =
  "Pursuant to Section 71835(l), all records pertaining to individuals who have successfully completed the program shall be available for the Department's inspection for a period of four (4) years beginning from the date of enrollment.";

const CDPH_E276A_FORM_CODE = 'CDPH E276A (12/19)';
const CDPH_E276A_LEGAL_FOOTER = 'This form is available at the eLearning Review Unit website.';

@Injectable()
export class CdphPdfService {
  generate283B(data: Cdph283BPdfData): Buffer {
    return renderCdph283B(data);
  }

  generateE276(data: CdphE276PdfData): Buffer {
    const doc = createCdphDocument();

    let y = drawCdphTitleBlock(
      doc,
      'ONLINE NURSE ASSISTANT TRAINING PROGRAM APPLICATION',
      'California Department of Public Health — eLearning Review Unit',
    );

    y = drawCdphSectionHeading(doc, y, 'PROVIDER INFORMATION');
    y = drawCdphFieldRow(doc, y, [
      { label: 'Provider Name', value: data.providerName },
      { label: 'County', value: data.county },
      { label: 'Phone Number', value: data.phoneNumber },
    ]);
    y = drawCdphFieldRow(doc, y, [{ label: 'Mailing Address', value: data.mailingAddress }]);
    y = drawCdphFieldRow(doc, y, [
      { label: "Provider's Contact Person", value: data.contactPersonName },
      { label: "Contact Person's Phone", value: data.contactPersonPhone },
      { label: "Contact Person's Email", value: data.contactPersonEmail },
    ]);

    y = drawCdphSectionHeading(doc, y, 'PROGRAM DETAILS');
    y = drawCdphFieldRow(doc, y, [
      { label: 'Provider Is A/An', value: data.providerType },
      { label: 'Application Type', value: data.applicationType },
      { label: 'Program Type', value: data.programType },
    ]);
    y = drawCdphFieldRow(doc, y, [
      { label: 'Provider Landing Page URL', value: data.providerLandingPageUrl },
      { label: 'Learning Management System URL', value: data.learningManagementSystemUrl },
    ]);
    y = drawCdphFieldRow(doc, y, [
      { label: 'Program Length', value: data.programLength },
      { label: 'Curriculum Name/Edition/Year', value: data.curriculumNameEditionYear },
      { label: 'Student Fees', value: data.studentFees },
    ]);

    y = drawCdphSectionHeading(doc, y, 'CURRICULUM — THEORY & CLINICAL HOURS BY MODULE');

    const totalTheoryHours = data.modules.reduce((sum, module) => sum + module.theoryHours, 0);
    const totalClinicalHours = data.modules.reduce((sum, module) => sum + module.clinicalHours, 0);

    autoTable(doc, {
      startY: y,
      head: [['Module', 'Theory Hours', 'Clinical Hours']],
      body: [
        ...data.modules.map((module) => [module.title, String(module.theoryHours), String(module.clinicalHours)]),
        ['Total Hours', String(totalTheoryHours), String(totalClinicalHours)],
      ],
      margin: { left: CDPH_MARGIN, right: CDPH_MARGIN },
      styles: { fontSize: 7.5, cellPadding: 1.5 },
      headStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: 'bold' },
      didParseCell: (hookData) => {
        if (hookData.row.index === data.modules.length) {
          hookData.cell.styles.fontStyle = 'bold';
        }
      },
    });

    drawCdphFooter(doc, CDPH_E276_LEGAL_FOOTER, CDPH_E276_FORM_CODE);

    return Buffer.from(doc.output('arraybuffer'));
  }

  generateE276C(data: CdphE276CPdfData): Buffer {
    const doc = createCdphDocument();

    let y = drawCdphTitleBlock(
      doc,
      'ONLINE NURSE ASSISTANT CERTIFICATION TRAINING PROGRAM INDIVIDUAL STUDENT RECORD',
      'California Department of Public Health',
    );

    y = drawCdphFieldRow(doc, y, [
      { label: 'Student Name', value: data.studentName },
      { label: 'Social Security Number', value: data.ssn },
    ]);
    y = drawCdphFieldRow(doc, y, [
      { label: 'Start Date', value: data.startDate },
      { label: 'Completion Date', value: data.completionDate },
      { label: 'Final Grade', value: data.finalGrade },
    ]);
    y = drawCdphFieldRow(doc, y, [{ label: 'Instructor Name', value: data.instructorName }]);

    const body: unknown[][] = [];
    data.modules.forEach((module) => {
      body.push([{ content: module.moduleTitle, colSpan: 5, styles: { fontStyle: 'bold', fillColor: [230, 230, 230] } }]);
      module.topics.forEach((topic) => {
        body.push([
          topic.label,
          topic.hours != null ? String(topic.hours) : '',
          topic.date ?? '',
          topic.instructorInitials ?? '',
          topic.testScore != null ? String(topic.testScore) : '',
        ]);
      });
    });

    autoTable(doc, {
      startY: y,
      head: [['Theory Content', 'Hours', 'Date', 'Instructor Initials', 'Test Score']],
      body: body as never,
      margin: { left: CDPH_MARGIN, right: CDPH_MARGIN },
      styles: { fontSize: 7, cellPadding: 1.2 },
      headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: 'bold' },
    });

    drawCdphFooter(doc, CDPH_E276C_LEGAL_FOOTER, CDPH_E276C_FORM_CODE);

    return Buffer.from(doc.output('arraybuffer'));
  }

  generateE276A(data: CdphE276APdfData): Buffer {
    const doc = createCdphDocument();

    let y = drawCdphTitleBlock(doc, 'ONLINE NURSE ASSISTANT TRAINING PROGRAM SKILLS CHECKLIST', 'California Department of Public Health');

    y = drawCdphFieldRow(doc, y, [
      { label: 'Student Name', value: data.studentName },
      { label: 'Social Security Number', value: data.ssn },
    ]);
    y = drawCdphFieldRow(doc, y, [
      { label: 'Instructor Name', value: data.instructorName },
      { label: 'Training Program Name', value: data.trainingProgramName },
    ]);
    y = drawCdphFieldRow(doc, y, [
      { label: 'Clinical Site Name', value: data.clinicalSiteName },
      { label: 'Start Date', value: data.startDate },
      { label: 'Completion Date', value: data.completionDate },
    ]);

    const body: unknown[][] = [];
    data.modules.forEach((module) => {
      body.push([
        {
          content: `${module.moduleTitle} (${module.clinicalHours} Clinical Hour${module.clinicalHours === 1 ? '' : 's'})`,
          colSpan: 5,
          styles: { fontStyle: 'bold', fillColor: [230, 230, 230] },
        },
      ]);
      module.items.forEach((item) => {
        body.push([
          item.label,
          item.status ?? '',
          item.comments ?? '',
          item.datePerformed ?? '',
          item.instructorInitials ?? '',
        ]);
      });
    });

    autoTable(doc, {
      startY: y,
      head: [['Skill Demonstrated', 'S/U', 'Comments', 'Date Performed', 'Instructor Initials']],
      body: body as never,
      margin: { left: CDPH_MARGIN, right: CDPH_MARGIN },
      styles: { fontSize: 7, cellPadding: 1.2 },
      headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: 'bold' },
    });

    drawCdphFooter(doc, CDPH_E276A_LEGAL_FOOTER, CDPH_E276A_FORM_CODE);

    return Buffer.from(doc.output('arraybuffer'));
  }
}
