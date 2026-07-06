import { BadRequestException } from '@nestjs/common';

import { AuditorPortalRepository } from './auditor-portal.repository';
import { AuditorPortalService } from './auditor-portal.service';

describe('AuditorPortalService', () => {
  let service: AuditorPortalService;

  beforeEach(() => {
    service = new AuditorPortalService(new AuditorPortalRepository());
  });

  it('returns the auditor dashboard snapshot', () => {
    const dashboard = service.getDashboard('auditor-alex');

    expect(dashboard.profile.fullName).toBe('Alex Auditor');
    expect(dashboard.kpis.length).toBeGreaterThan(0);
  });

  it('verifies a student record', () => {
    const student = service.verifyStudentRecord('auditor-alex', 'student-elena', {
      status: 'On Track',
      certificationEligibility: 'Pending Review',
      note: 'Safety evidence received and awaiting final transcript reconciliation.',
    });

    expect(student?.status).toBe('On Track');
    expect(student?.notes.at(-1)).toContain('Safety evidence received');
  });

  it('rejects blank student notes', () => {
    expect(() =>
      service.addStudentNote('auditor-alex', 'student-alice', {
        note: '   ',
      }),
    ).toThrow(BadRequestException);
  });

  it('reviews an instructor qualification', () => {
    const instructor = service.reviewInstructorQualification('auditor-alex', 'instructor-jennifer', {
      status: 'Compliant',
      note: 'Remediation evidence accepted and credential is current.',
    });

    expect(instructor?.status).toBe('Compliant');
    expect(instructor?.notes.at(-1)).toContain('Remediation evidence accepted');
  });

  it('resolves a clinical compliance item', () => {
    const item = service.resolveClinicalComplianceItem('auditor-alex', 'safety-protocols', {
      status: 'Compliant',
    });

    expect(item?.status).toBe('Compliant');
  });

  it('uploads an auditor document', () => {
    const document = service.uploadDocument('auditor-alex', {
      title: 'Transcript Evidence Bundle',
      type: 'Bundle',
      category: 'Regulatory',
      owner: 'Compliance Office',
      size: '8.2 MB',
    });

    expect(document.title).toBe('Transcript Evidence Bundle');
    expect(document.status).toBe('Needs Review');
  });

  it('queues an auditor report export', () => {
    const exportRow = service.generateReportExport('auditor-alex', {
      reportId: 'clinical-hour-audit',
      format: 'pdf',
    });

    expect(exportRow.status).toBe('Preset: CDPH');
    expect(exportRow.format).toBe('PDF');
  });

  it('updates an auditor setting', () => {
    const preference = service.updateSetting('auditor-alex', {
      preferenceId: 'cloud-backup',
      enabled: false,
    });

    expect(preference?.enabled).toBe(false);
  });
});
