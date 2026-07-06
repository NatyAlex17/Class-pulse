import { BadRequestException, Injectable } from '@nestjs/common';

import type {
  AddAdminApplicationNoteDto,
  AdminApplicationDetail,
  AdminAuditEvent,
  AdminPortalState,
  GenerateAdminReportExportDto,
  UpdateAdminApplicationStatusDto,
  UploadAdminDocumentDto,
} from '../types/admin-portal.types';
import { AdminPortalRepository } from './admin-portal.repository';

@Injectable()
export class AdminPortalService {
  constructor(private readonly repository: AdminPortalRepository) {}

  getPortal(adminId: string) {
    return this.repository.findByAdminId(adminId);
  }

  getDashboard(adminId: string) {
    return this.repository.findByAdminId(adminId).dashboard;
  }

  getOperations(adminId: string) {
    const portal = this.repository.findByAdminId(adminId);
    return {
      ...portal.operations,
      cohorts: portal.cohorts,
      financials: portal.financials,
      curriculum: portal.curriculum,
      settings: portal.settings,
    };
  }

  getApplications(adminId: string) {
    const portal = this.repository.findByAdminId(adminId);
    return {
      activeApplicationId: portal.activeApplicationId,
      applications: portal.applications,
    };
  }

  getApplication(adminId: string, applicationId: string) {
    return this.getApplicationOrThrow(this.repository.findByAdminId(adminId), applicationId);
  }

  setActiveApplication(adminId: string, applicationId: string) {
    const portal = this.repository.findByAdminId(adminId);
    this.getApplicationOrThrow(portal, applicationId);
    portal.activeApplicationId = applicationId;
    return this.repository.save(portal).activeApplicationId;
  }

  updateApplicationStatus(adminId: string, applicationId: string, payload: UpdateAdminApplicationStatusDto) {
    const portal = this.repository.findByAdminId(adminId);
    const application = this.getApplicationOrThrow(portal, applicationId);

    application.status = payload.status;
    application.updated = new Date().toISOString();
    if (payload.reason?.trim()) {
      application.notes = [...application.notes, payload.reason.trim()];
    }

    this.recordAudit(portal, 'admin.application.status.updated', applicationId, {
      status: payload.status,
    });
    return this.repository.save(portal).applications.find((item) => item.id === applicationId);
  }

  addApplicationNote(adminId: string, applicationId: string, payload: AddAdminApplicationNoteDto) {
    const note = payload.note.trim();
    if (!note) {
      throw new BadRequestException('Application note cannot be empty.');
    }

    const portal = this.repository.findByAdminId(adminId);
    const application = this.getApplicationOrThrow(portal, applicationId);
    application.notes = [...application.notes, note];
    application.updated = new Date().toISOString();

    this.recordAudit(portal, 'admin.application.note.added', applicationId);
    return this.repository.save(portal).applications.find((item) => item.id === applicationId);
  }

  getReviewQueue(adminId: string) {
    const portal = this.repository.findByAdminId(adminId);
    return {
      activeReviewQueueId: portal.activeReviewQueueId,
      queue: portal.reviewQueue,
    };
  }

  setActiveReviewQueue(adminId: string, queueId: string) {
    const portal = this.repository.findByAdminId(adminId);
    const exists = portal.reviewQueue.some((item) => item.id === queueId);

    if (!exists) {
      throw new BadRequestException(`Review queue item "${queueId}" was not found.`);
    }

    portal.activeReviewQueueId = queueId;
    return this.repository.save(portal).activeReviewQueueId;
  }

  getReports(adminId: string) {
    return this.repository.findByAdminId(adminId).reports;
  }

  generateReportExport(adminId: string, payload: GenerateAdminReportExportDto) {
    const portal = this.repository.findByAdminId(adminId);
    const card = portal.reports.cards.find((item) => item.id === payload.reportId);

    if (!card) {
      throw new BadRequestException(`Report "${payload.reportId}" was not found.`);
    }

    const exportRow = {
      id: `export-${Date.now()}`,
      report: card.title,
      scope: 'Generated on demand',
      format: payload.format.trim().toUpperCase(),
      cadence: 'On demand',
      updated: new Date().toISOString(),
      status: 'Queued' as const,
    };

    portal.reports.exports = [exportRow, ...portal.reports.exports];
    this.recordAudit(portal, 'admin.report.export.generated', exportRow.id, {
      reportId: payload.reportId,
      format: exportRow.format,
    });
    return this.repository.save(portal).reports.exports[0];
  }

  getDocuments(adminId: string) {
    return this.repository.findByAdminId(adminId).documents;
  }

  uploadDocument(adminId: string, payload: UploadAdminDocumentDto) {
    if (!payload.name.trim() || !payload.owner.trim()) {
      throw new BadRequestException('Document name and owner are required.');
    }

    const portal = this.repository.findByAdminId(adminId);
    const document = {
      id: `doc-${Date.now()}`,
      name: payload.name.trim(),
      category: payload.category,
      owner: payload.owner.trim(),
      updated: new Date().toISOString().slice(0, 10),
      status: payload.status ?? 'Pending',
    };

    portal.documents = [document, ...portal.documents];
    this.recordAudit(portal, 'admin.document.uploaded', document.id);
    return this.repository.save(portal).documents[0];
  }

  getCohorts(adminId: string) {
    const portal = this.repository.findByAdminId(adminId);
    return portal.cohorts;
  }

  getCurriculumSummary(adminId: string) {
    return this.repository.findByAdminId(adminId).curriculum;
  }

  getFinancialSummary(adminId: string) {
    return this.repository.findByAdminId(adminId).financials;
  }

  getSettingsSummary(adminId: string) {
    return this.repository.findByAdminId(adminId).settings;
  }

  private getApplicationOrThrow(portal: AdminPortalState, applicationId: string): AdminApplicationDetail {
    const application = portal.applications.find((item) => item.id === applicationId);

    if (!application) {
      throw new BadRequestException(`Application "${applicationId}" was not found.`);
    }

    return application;
  }

  private recordAudit(
    portal: AdminPortalState,
    action: string,
    target: string,
    details?: Record<string, string | number | boolean | undefined>,
  ) {
    const filteredDetails = Object.fromEntries(
      Object.entries(details ?? {}).filter(([, value]) => value !== undefined),
    ) as Record<string, string | number | boolean>;

    const event: AdminAuditEvent = {
      id: `audit-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      actor: portal.profile.id,
      action,
      target,
      occurredAt: new Date().toISOString(),
      details: Object.keys(filteredDetails).length > 0 ? filteredDetails : undefined,
    };

    portal.auditTrail = [event, ...portal.auditTrail];
  }
}
