import { BadRequestException } from '@nestjs/common';

import { DocumentRequirementsConfigService } from '../../student/services/document-requirements-config.service';
import { LearningResourcesConfigService } from '../../student/services/learning-resources-config.service';
import type { StudentPortalService } from '../../student/services/student-portal.service';
import type { StudentPortalState } from '../../student/types/student-portal.types';
import { InstructorIntakeSubmissionService } from './instructor-intake-submission.service';
import { InstructorOnboardingQuestionsConfigService } from './instructor-onboarding-questions-config.service';
import { InstructorPortalRepository } from './instructor-portal.repository';
import { InstructorPortalService } from './instructor-portal.service';

// Minimal stand-in for a real student enrolled in the same module ('m1') that the
// seeded instructor (Dr. Sarah Chen) is approved to teach, so student-lookup methods
// (addStudentNote, assignStudentToSlot) resolve without wiring up the full student module.
const fakeStudentPortal = {
  profile: {
    id: 'student-alice-smith',
    fullName: 'Alice Smith',
    email: 'alice.smith@example.com',
    phone: '(555) 123-4567',
    location: 'Portland, OR',
    cohort: 'CNA Cohort 12',
    cohortId: 'cohort-1',
    levelLabel: 'Level 1',
    studentNumber: 'STU-001',
  },
  modules: [
    {
      id: 'm1',
      title: 'Foundation of Patient Care',
      summary: '',
      status: 'Complete',
      progressPercent: 100,
      requiredHours: 40,
      completedHours: 40,
      certificateUnlocked: true,
      skills: [{ id: 'skill-3', name: 'Blood pressure measurement' }],
      steps: [
        { id: 'step-1', title: 'Step 1', type: 'Video', duration: '10 min', note: '', complete: true },
        { id: 'step-2', title: 'Step 2', type: 'Video', duration: '10 min', note: '', complete: true },
      ],
    },
  ],
  clinicalSessions: [],
  attendanceRecords: [],
} as unknown as StudentPortalState;

const studentPortalServiceStub = {
  findAllStudentPortals: () => [fakeStudentPortal],
} as unknown as StudentPortalService;

describe('InstructorPortalService', () => {
  let service: InstructorPortalService;

  beforeEach(() => {
    service = new InstructorPortalService(
      new InstructorPortalRepository(new InstructorOnboardingQuestionsConfigService()),
      new DocumentRequirementsConfigService(),
      new LearningResourcesConfigService(),
      new InstructorIntakeSubmissionService(),
      studentPortalServiceStub,
    );
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
    const workspace = service.reviewSkillItem('instructor-sarah-chen', 'student-alice-smith', 'skill-3', {
      status: 'Verified',
      feedback: 'Observed and approved during supervised practice.',
    });

    expect(workspace?.groups[0]?.items.find((item) => item.id === 'skill-3')?.status).toBe('Verified');
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
