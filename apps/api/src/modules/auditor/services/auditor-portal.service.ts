import { BadRequestException, Injectable } from '@nestjs/common';

import type {
  AddAuditorStudentNoteDto,
  AuditorAuditEvent,
  AuditorClinicalComplianceItem,
  AuditorInstructorQualificationRecord,
  AuditorPortalState,
  AuditorStudentRecord,
  GenerateAuditorReportExportDto,
  ResolveAuditorClinicalItemDto,
  ReviewAuditorInstructorDto,
  UpdateAuditorDocumentStatusDto,
  UpdateAuditorProfileDto,
  UpdateAuditorSettingDto,
  UploadAuditorDocumentDto,
  VerifyAuditorStudentRecordDto,
} from '../types/auditor-portal.types';
import { AuditorPortalRepository } from './auditor-portal.repository';

@Injectable()
export class AuditorPortalService {
  constructor(private readonly repository: AuditorPortalRepository) {}

  getPortal(auditorId: string) {
    return this.repository.findByAuditorId(auditorId);
  }

  getDashboard(auditorId: string) {
    return this.repository.findByAuditorId(auditorId).dashboard;
  }

  getProfile(auditorId: string) {
    return this.repository.findByAuditorId(auditorId).profile;
  }

  updateProfile(auditorId: string, payload: UpdateAuditorProfileDto) {
    const portal = this.repository.findByAuditorId(auditorId);

    if (payload.phone?.trim()) {
      portal.profile.phone = payload.phone.trim();
      portal.dashboard.profile.phone = payload.phone.trim();
    }

    if (payload.location?.trim()) {
      portal.profile.location = payload.location.trim();
      portal.dashboard.profile.location = payload.location.trim();
    }

    this.recordAudit(portal, 'Profile updated', 'Success', portal.profile.id, 'Auditor profile details updated.', {
      phoneUpdated: Boolean(payload.phone?.trim()),
      locationUpdated: Boolean(payload.location?.trim()),
    });

    return this.repository.save(portal).profile;
  }

  getStudentRecords(auditorId: string) {
    return this.repository.findByAuditorId(auditorId).studentRecords;
  }

  getStudentRecord(auditorId: string, studentId: string) {
    return this.getStudentOrThrow(this.repository.findByAuditorId(auditorId), studentId);
  }

  setActiveStudent(auditorId: string, studentId: string) {
    const portal = this.repository.findByAuditorId(auditorId);
    this.getStudentOrThrow(portal, studentId);
    portal.studentRecords.activeStudentId = studentId;
    return this.repository.save(portal).studentRecords.activeStudentId;
  }

  addStudentNote(auditorId: string, studentId: string, payload: AddAuditorStudentNoteDto) {
    const note = payload.note.trim();

    if (!note) {
      throw new BadRequestException('Student note cannot be empty.');
    }

    const portal = this.repository.findByAuditorId(auditorId);
    const student = this.getStudentOrThrow(portal, studentId);
    student.notes = [...student.notes, note];
    student.lastReview = new Date().toISOString().slice(0, 10);

    this.recordAudit(portal, 'Student note added', 'Success', studentId, note);
    return this.repository.save(portal).studentRecords.records.find((item) => item.id === studentId);
  }

  verifyStudentRecord(auditorId: string, studentId: string, payload: VerifyAuditorStudentRecordDto) {
    const portal = this.repository.findByAuditorId(auditorId);
    const student = this.getStudentOrThrow(portal, studentId);

    student.status = payload.status;
    if (payload.certificationEligibility) {
      student.certificationEligibility = payload.certificationEligibility;
    }
    if (payload.note?.trim()) {
      student.notes = [...student.notes, payload.note.trim()];
    }
    student.lastReview = new Date().toISOString().slice(0, 10);

    this.recordAudit(
      portal,
      'Student record verified',
      payload.status === 'At Risk' ? 'Alert' : 'Success',
      studentId,
      payload.note?.trim() ?? `Student status set to ${payload.status}.`,
      {
        status: payload.status,
        certificationEligibility: student.certificationEligibility,
      },
    );

    return this.repository.save(portal).studentRecords.records.find((item) => item.id === studentId);
  }

  getInstructorQualifications(auditorId: string) {
    return this.repository.findByAuditorId(auditorId).instructorQualifications;
  }

  getInstructorQualification(auditorId: string, instructorId: string) {
    return this.getInstructorOrThrow(this.repository.findByAuditorId(auditorId), instructorId);
  }

  setActiveInstructor(auditorId: string, instructorId: string) {
    const portal = this.repository.findByAuditorId(auditorId);
    this.getInstructorOrThrow(portal, instructorId);
    portal.instructorQualifications.activeInstructorId = instructorId;
    return this.repository.save(portal).instructorQualifications.activeInstructorId;
  }

  reviewInstructorQualification(auditorId: string, instructorId: string, payload: ReviewAuditorInstructorDto) {
    const portal = this.repository.findByAuditorId(auditorId);
    const instructor = this.getInstructorOrThrow(portal, instructorId);

    instructor.status = payload.status;
    instructor.lastReview = new Date().toISOString().slice(0, 10);
    if (payload.note?.trim()) {
      instructor.notes = [...instructor.notes, payload.note.trim()];
    }

    this.recordAudit(
      portal,
      'Instructor qualification reviewed',
      payload.status === 'Compliant' ? 'Success' : 'Review',
      instructorId,
      payload.note?.trim() ?? `Instructor status set to ${payload.status}.`,
      { status: payload.status },
    );

    return this.repository.save(portal).instructorQualifications.instructors.find((item) => item.id === instructorId);
  }

  getClinicalCompliance(auditorId: string) {
    return this.repository.findByAuditorId(auditorId).clinicalCompliance;
  }

  resolveClinicalComplianceItem(
    auditorId: string,
    itemId: string,
    payload: ResolveAuditorClinicalItemDto,
  ) {
    const portal = this.repository.findByAuditorId(auditorId);
    const item = this.getClinicalItemOrThrow(portal, itemId);

    item.status = payload.status;
    item.lastAudit = new Date().toISOString();
    item.actionRequired = payload.actionRequired?.trim() || undefined;
    portal.clinicalCompliance.summary.lastAudit = item.lastAudit;

    portal.clinicalCompliance.summary.issuesOpen = portal.clinicalCompliance.items.filter(
      (entry) => entry.status !== 'Compliant',
    ).length;
    portal.clinicalCompliance.summary.complianceRate = `${Math.round(
      (portal.clinicalCompliance.items.filter((entry) => entry.status === 'Compliant').length /
        portal.clinicalCompliance.items.length) *
        100,
    )}%`;

    this.recordAudit(
      portal,
      'Clinical compliance item reviewed',
      payload.status === 'Compliant' ? 'Success' : 'Alert',
      itemId,
      payload.actionRequired?.trim() ?? `${item.category} marked ${payload.status}.`,
      { status: payload.status },
    );

    return this.repository.save(portal).clinicalCompliance.items.find((entry) => entry.id === itemId);
  }

  getProgramRequirements(auditorId: string) {
    return this.repository.findByAuditorId(auditorId).programRequirements;
  }

  setActiveProgram(auditorId: string, programId: string) {
    const portal = this.repository.findByAuditorId(auditorId);
    const exists = portal.programRequirements.programs.some((item) => item.id === programId);

    if (!exists) {
      throw new BadRequestException(`Program "${programId}" was not found.`);
    }

    portal.programRequirements.activeProgramId = programId;
    return this.repository.save(portal).programRequirements.activeProgramId;
  }

  getDocuments(auditorId: string) {
    return this.repository.findByAuditorId(auditorId).documents;
  }

  uploadDocument(auditorId: string, payload: UploadAuditorDocumentDto) {
    if (!payload.title.trim() || !payload.owner.trim() || !payload.size.trim()) {
      throw new BadRequestException('Document title, owner, and size are required.');
    }

    const portal = this.repository.findByAuditorId(auditorId);
    const document = {
      id: `doc-${Date.now()}`,
      title: payload.title.trim(),
      type: payload.type,
      category: payload.category,
      status: payload.status ?? 'Needs Review',
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 16),
      size: payload.size.trim(),
      owner: payload.owner.trim(),
    };

    portal.documents.documents = [document, ...portal.documents.documents];
    portal.documents.summary.totalDocuments += 1;
    if (document.status === 'Current') {
      portal.documents.summary.current += 1;
    }
    if (document.status === 'Needs Review') {
      portal.documents.summary.needsReview += 1;
    }

    this.recordAudit(portal, 'Document uploaded', 'Success', document.id, `${document.title} uploaded for audit review.`);
    return this.repository.save(portal).documents.documents[0];
  }

  updateDocumentStatus(auditorId: string, documentId: string, payload: UpdateAuditorDocumentStatusDto) {
    const portal = this.repository.findByAuditorId(auditorId);
    const document = portal.documents.documents.find((item) => item.id === documentId);

    if (!document) {
      throw new BadRequestException(`Document "${documentId}" was not found.`);
    }

    document.status = payload.status;
    document.lastUpdated = new Date().toISOString().replace('T', ' ').slice(0, 16);
    this.recalculateDocumentSummary(portal);

    this.recordAudit(
      portal,
      'Document status updated',
      payload.status === 'Current' ? 'Success' : 'Review',
      documentId,
      `${document.title} marked ${payload.status}.`,
      { status: payload.status },
    );

    return this.repository.save(portal).documents.documents.find((item) => item.id === documentId);
  }

  getReports(auditorId: string) {
    return this.repository.findByAuditorId(auditorId).reports;
  }

  generateReportExport(auditorId: string, payload: GenerateAuditorReportExportDto) {
    const portal = this.repository.findByAuditorId(auditorId);
    const card = portal.reports.cards.find((item) => item.id === payload.reportId);

    if (!card) {
      throw new BadRequestException(`Report "${payload.reportId}" was not found.`);
    }

    const exportRow = {
      id: `export-${Date.now()}`,
      report: card.title,
      status: card.id === 'clinical-hour-audit' ? ('Preset: CDPH' as const) : ('Up to date' as const),
      generated: new Date().toISOString().replace('T', ' ').slice(0, 16),
      format: payload.format.trim().toUpperCase(),
      category:
        card.id === 'clinical-hour-audit'
          ? ('Clinical' as const)
          : card.id === 'instructor-qualifications-summary'
            ? ('Qualifications' as const)
            : card.id === 'state-regulatory-packet'
              ? ('Regulatory' as const)
              : ('Compliance' as const),
    };

    portal.reports.exportHistory = [exportRow, ...portal.reports.exportHistory];

    if (card.id === 'clinical-hour-audit' || card.id === 'state-regulatory-packet') {
      portal.regulatorAccess.auditPacketsReady += 1;
    }

    if (card.id === 'state-regulatory-packet') {
      portal.regulatorAccess.evidenceBundlesReady += 1;
    }

    if (card.id === 'comprehensive-compliance-report') {
      portal.regulatorAccess.transcriptExportsReady += 1;
    }

    this.recordAudit(
      portal,
      'Evidence export initiated',
      'Success',
      exportRow.id,
      `${card.title} generated in ${exportRow.format}.`,
      { reportId: payload.reportId, format: exportRow.format },
    );

    return this.repository.save(portal).reports.exportHistory[0];
  }

  getAuditLog(auditorId: string) {
    return this.repository.findByAuditorId(auditorId).auditTrail;
  }

  getSettings(auditorId: string) {
    return this.repository.findByAuditorId(auditorId).settings;
  }

  updateSetting(auditorId: string, payload: UpdateAuditorSettingDto) {
    const portal = this.repository.findByAuditorId(auditorId);
    const preference = portal.settings.preferences.find((item) => item.id === payload.preferenceId);

    if (!preference) {
      throw new BadRequestException(`Preference "${payload.preferenceId}" was not found.`);
    }

    preference.enabled = payload.enabled;

    this.recordAudit(
      portal,
      'Auditor setting updated',
      'Success',
      payload.preferenceId,
      `${preference.label} ${payload.enabled ? 'enabled' : 'disabled'}.`,
      { enabled: payload.enabled },
    );

    return this.repository.save(portal).settings.preferences.find((item) => item.id === payload.preferenceId);
  }

  getRegulatorAccess(auditorId: string) {
    return this.repository.findByAuditorId(auditorId).regulatorAccess;
  }

  private getStudentOrThrow(portal: AuditorPortalState, studentId: string): AuditorStudentRecord {
    const student = portal.studentRecords.records.find((item) => item.id === studentId);

    if (!student) {
      throw new BadRequestException(`Student record "${studentId}" was not found.`);
    }

    return student;
  }

  private getInstructorOrThrow(
    portal: AuditorPortalState,
    instructorId: string,
  ): AuditorInstructorQualificationRecord {
    const instructor = portal.instructorQualifications.instructors.find((item) => item.id === instructorId);

    if (!instructor) {
      throw new BadRequestException(`Instructor qualification "${instructorId}" was not found.`);
    }

    return instructor;
  }

  private getClinicalItemOrThrow(portal: AuditorPortalState, itemId: string): AuditorClinicalComplianceItem {
    const item = portal.clinicalCompliance.items.find((entry) => entry.id === itemId);

    if (!item) {
      throw new BadRequestException(`Clinical compliance item "${itemId}" was not found.`);
    }

    return item;
  }

  private recalculateDocumentSummary(portal: AuditorPortalState) {
    portal.documents.summary = {
      totalDocuments: portal.documents.documents.length,
      current: portal.documents.documents.filter((item) => item.status === 'Current').length,
      needsReview: portal.documents.documents.filter((item) => item.status === 'Needs Review').length,
    };
  }

  private recordAudit(
    portal: AuditorPortalState,
    action: string,
    status: AuditorAuditEvent['status'],
    target: string,
    details: string,
    metadata?: Record<string, string | number | boolean>,
  ) {
    const event: AuditorAuditEvent = {
      id: `audit-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      action,
      actor: portal.profile.fullName,
      status,
      details,
      target,
      metadata,
    };

    portal.auditTrail = [event, ...portal.auditTrail];
  }
}
