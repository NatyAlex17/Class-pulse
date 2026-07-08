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
  clinicalLogs: [
    {
      id: 'log-1',
      date: '2026-06-28',
      moduleId: 'm1',
      moduleTitle: 'Foundation of Patient Care',
      hours: 6,
      instructor: 'Dr. Sarah Chen',
      status: 'Pending',
    },
  ],
} as unknown as StudentPortalState;

const studentPortalServiceStub = {
  findAllStudentPortals: () => [fakeStudentPortal],
  reviewClinicalLogForInstructor: (studentId: string, logId: string, status: string, note?: string) => {
    const log = (fakeStudentPortal as unknown as { clinicalLogs: Array<Record<string, unknown>> }).clinicalLogs.find(
      (item) => item.id === logId,
    );
    if (log) {
      log.status = status;
      log.note = note ?? log.note;
    }
    return log;
  },
  logClinicalHoursFromInstructor: (
    studentId: string,
    payload: { moduleId: string; moduleTitle: string; hours: number; instructor: string; note?: string },
  ) => {
    const logs = (fakeStudentPortal as unknown as { clinicalLogs: Array<Record<string, unknown>> }).clinicalLogs;
    const logEntry = {
      id: `log-${logs.length + 1}`,
      date: '2026-07-08',
      moduleId: payload.moduleId,
      moduleTitle: payload.moduleTitle,
      hours: payload.hours,
      instructor: payload.instructor,
      note: payload.note,
      status: 'Verified',
    };
    logs.unshift(logEntry);
    return logEntry;
  },
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

    expect(log.status).toBe('Flagged');
    expect(log.note).toContain('supervisor initials');
  });

  it('queues a report export request', () => {
    const exportRow = service.generateReportExport('instructor-sarah-chen', {
      reportId: 'clinical-compliance-audit',
      format: 'csv',
    });

    expect(exportRow.status).toBe('Queued');
    expect(exportRow.format).toBe('CSV');
  });

  it('starts and stops a clinical timer, logging verified hours for the student', () => {
    jest.useFakeTimers();
    try {
      service.startClinicalTimer('instructor-sarah-chen', {
        studentId: 'student-alice-smith',
        moduleId: 'm1',
      });
      jest.advanceTimersByTime(60 * 60 * 1000);

      const log = service.stopClinicalTimer('instructor-sarah-chen', {
        note: 'Observed vitals check.',
      });

      expect(log.status).toBe('Verified');
      expect(log.hours).toBeCloseTo(1, 1);
      expect(log.note).toContain('Observed vitals check');
    } finally {
      jest.useRealTimers();
    }
  });

  it('prevents starting a second clinical timer while one is already running', () => {
    service.startClinicalTimer('instructor-sarah-chen', {
      studentId: 'student-alice-smith',
      moduleId: 'm1',
    });

    try {
      expect(() =>
        service.startClinicalTimer('instructor-sarah-chen', {
          studentId: 'student-alice-smith',
          moduleId: 'm1',
        }),
      ).toThrow(BadRequestException);
    } finally {
      // Clean up so this test's timer doesn't leak into the persisted dev data file.
      expect(() => service.stopClinicalTimer('instructor-sarah-chen', {})).toThrow(BadRequestException);
    }
  });

  it('rejects starting a timer for a student outside the instructor’s assigned modules', () => {
    expect(() =>
      service.startClinicalTimer('instructor-sarah-chen', {
        studentId: 'student-alice-smith',
        moduleId: 'not-a-real-module',
      }),
    ).toThrow(BadRequestException);
  });

  it('reports no availability conflicts when the declared window covers the real schedule', () => {
    const availability = service.getAvailability('instructor-sarah-chen');
    expect(availability.conflicts).toEqual([]);
  });

  it('flags a real booked session that falls outside the instructor’s declared availability', () => {
    // The seeded schedule has a real Monday 08:00 slot; narrowing Monday's window past
    // that time should surface it as a conflict instead of the old hardcoded copy.
    const withConflict = service.updateAvailability('instructor-sarah-chen', { monday: '09:00 - 05:00' });
    expect(withConflict.conflicts.some((conflict) => conflict.startsWith('Monday 08:00'))).toBe(true);

    const restored = service.updateAvailability('instructor-sarah-chen', { monday: '08:00 - 04:00' });
    expect(restored.conflicts).toEqual([]);
  });
});
