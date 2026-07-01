import { BadRequestException } from '@nestjs/common';

import { InstructorPortalRepository } from './instructor-portal.repository';
import { InstructorPortalService } from './instructor-portal.service';

describe('InstructorPortalService', () => {
  let service: InstructorPortalService;

  beforeEach(() => {
    service = new InstructorPortalService(new InstructorPortalRepository());
  });

  it('returns the instructor dashboard snapshot', () => {
    const dashboard = service.getDashboard('instructor-sarah-chen');

    expect(dashboard.profile.fullName).toBe('Dr. Sarah Chen');
    expect(dashboard.metrics.length).toBeGreaterThan(0);
  });

  it('adds a review note to a student record', () => {
    const student = service.addStudentNote('instructor-sarah-chen', 'student-alice-smith', {
      note: 'Observed strong improvement during lab review.',
    });

    expect(student?.recentNotes[0]?.note).toContain('Observed strong improvement');
  });

  it('sends an instructor inbox reply', () => {
    const conversation = service.sendMessage('instructor-sarah-chen', {
      conversationId: 'conv-alice',
      body: 'You are cleared for tomorrow morning. Bring the updated checklist.',
    });

    expect(conversation?.messages.at(-1)?.from).toBe('instructor');
  });

  it('prevents assigning the same student to the same schedule slot twice', () => {
    expect(() =>
      service.assignStudentToSlot('instructor-sarah-chen', 'slot-1', {
        studentId: 'student-alice-smith',
      }),
    ).toThrow(BadRequestException);
  });

  it('reviews a skill checklist item and updates workspace progress', () => {
    const workspace = service.reviewSkillItem('instructor-sarah-chen', 'skill-3', {
      status: 'Verified',
      feedback: 'Observed and approved during supervised practice.',
    });

    expect(workspace.groups[0]?.items.find((item) => item.id === 'skill-3')?.status).toBe('Verified');
  });

  it('flags a clinical log with reviewer notes', () => {
    const log = service.reviewClinicalLog('instructor-sarah-chen', 'log-1', {
      status: 'Flagged',
      note: 'Need supervisor initials before verification.',
    });

    expect(log?.status).toBe('Flagged');
    expect(log?.note).toContain('supervisor initials');
  });

  it('queues a report export request', () => {
    const exportRow = service.generateReportExport('instructor-sarah-chen', {
      reportId: 'report-hours-audit',
      format: 'csv',
    });

    expect(exportRow.status).toBe('Queued');
    expect(exportRow.format).toBe('CSV');
  });
});
