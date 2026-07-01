import { BadRequestException } from '@nestjs/common';

import { AdminPortalRepository } from './admin-portal.repository';
import { AdminPortalService } from './admin-portal.service';

describe('AdminPortalService', () => {
  let service: AdminPortalService;

  beforeEach(() => {
    service = new AdminPortalService(new AdminPortalRepository());
  });

  it('returns the admin dashboard snapshot', () => {
    const dashboard = service.getDashboard('admin-charlie');

    expect(dashboard.profile.fullName).toBe('Charlie Admin');
    expect(dashboard.kpis.length).toBeGreaterThan(0);
  });

  it('updates an application status', () => {
    const application = service.updateApplicationStatus('admin-charlie', '001', {
      status: 'Approved',
      reason: 'Admissions review complete and packet accepted.',
    });

    expect(application?.status).toBe('Approved');
    expect(application?.notes.at(-1)).toContain('Admissions review complete');
  });

  it('adds an application note', () => {
    const application = service.addApplicationNote('admin-charlie', '002', {
      note: 'Requested missing TB clearance from applicant.',
    });

    expect(application?.notes.at(-1)).toContain('Requested missing TB clearance');
  });

  it('rejects blank application notes', () => {
    expect(() =>
      service.addApplicationNote('admin-charlie', '002', {
        note: '   ',
      }),
    ).toThrow(BadRequestException);
  });

  it('switches the active review queue item', () => {
    const activeQueueId = service.setActiveReviewQueue('admin-charlie', 'queue-noah');
    expect(activeQueueId).toBe('queue-noah');
  });

  it('queues an admin report export', () => {
    const exportRow = service.generateReportExport('admin-charlie', {
      reportId: 'admissions-queue-audit',
      format: 'csv',
    });

    expect(exportRow.status).toBe('Queued');
    expect(exportRow.format).toBe('CSV');
  });

  it('uploads an admin document', () => {
    const document = service.uploadDocument('admin-charlie', {
      name: 'Quarterly Compliance Memo',
      category: 'Compliance',
      owner: 'Operations',
    });

    expect(document.name).toBe('Quarterly Compliance Memo');
    expect(document.status).toBe('Pending');
  });
});
