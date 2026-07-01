import { Injectable, NotFoundException } from '@nestjs/common';

import type { LocalUserRecord } from '../../auth/types/auth-user.types';
import { studentPortalSeed } from '../data/student-portal.seed';
import {
  ClinicalLogEntry,
  StudentAuditEvent,
  StudentPortalState,
  StudentThread,
} from '../types/student-portal.types';

@Injectable()
export class StudentPortalRepository {
  private readonly portalByStudentId = new Map<string, StudentPortalState>();

  constructor() {
    studentPortalSeed.forEach((portal) => {
      this.portalByStudentId.set(portal.profile.id, this.clone(portal));
    });
  }

  findByStudentId(studentId: string): StudentPortalState {
    const portal = this.portalByStudentId.get(studentId);

    if (!portal) {
      throw new NotFoundException(`Student portal state not found for "${studentId}".`);
    }

    return this.clone(portal);
  }

  ensureForLocalUser(localUser: LocalUserRecord): StudentPortalState {
    const existing = this.portalByStudentId.get(localUser.id);
    if (existing) {
      return this.clone(existing);
    }

    const template = studentPortalSeed[0];
    const [firstName = 'Student'] = this.humanizeName(localUser.email).split(' ');
    const personalized: StudentPortalState = this.clone({
      ...template,
      profile: {
        ...template.profile,
        id: localUser.id,
        fullName: this.humanizeName(localUser.email),
        preferredName: firstName,
        email: localUser.email,
        studentNumber: this.buildStudentNumber(localUser.id),
      },
      workflowStage: 'entrance_exam',
      entranceExam: {
        answers: {},
        score: null,
        taken: false,
        passed: false,
      },
      enrollmentWizard: {
        step: 1,
        hhaAddon: false,
        scrubTop: '',
        scrubBottom: '',
        shipping: 'pickup',
        wantsToTestAtDaisy: null,
        agreements: {
          ip: false,
          refund: false,
          conduct: false,
          lateFee: false,
        },
        signature: '',
        submitted: false,
      },
      entranceSurvey: {
        step: 1,
        answers: {},
        completed: false,
      },
      onboarding: {
        ...template.onboarding,
        workflowStage: 'entrance_exam',
        submitted: false,
        questions: template.onboarding.questions.map((question) => ({
          ...question,
          answer: '',
        })),
        acknowledgements: {
          schedule: false,
          attendance: false,
          technology: false,
        },
        readinessUploads: {
          photoId: false,
          diploma: false,
          tbTest: false,
        },
        steps: template.onboarding.steps.map((step) => ({
          ...step,
          complete: false,
        })),
      },
      tasks: template.tasks.map((task) => ({
        ...task,
        complete: false,
      })),
      activeModuleId: template.modules[0]?.id ?? template.activeModuleId,
      modules: template.modules.map((module, index) => ({
        ...module,
        status: index === 0 ? 'In Progress' : 'Locked',
        progressPercent: 0,
        completedHours: 0,
        examScore: undefined,
        certificateUnlocked: false,
        steps: module.steps.map((step) => ({
          ...step,
          complete: false,
        })),
      })),
      clinicalLogs: [],
      attendanceRecords: [],
      learningMinutes: 0,
      learningSessionActive: false,
      textbookIssued: false,
      textbookOpened: false,
      exitSurveyComplete: false,
      reflectionResponse: '',
      questionOfDayAnswer: '',
      lastAction: 'Student portal initialized from authenticated sign-up.',
    });

    this.portalByStudentId.set(localUser.id, personalized);
    return this.clone(personalized);
  }

  save(portal: StudentPortalState): StudentPortalState {
    this.portalByStudentId.set(portal.profile.id, this.clone(portal));
    return this.clone(portal);
  }

  appendAuditEvent(studentId: string, event: StudentAuditEvent): StudentPortalState {
    const portal = this.findByStudentId(studentId);
    portal.auditTrail = [event, ...portal.auditTrail];
    return this.save(portal);
  }

  upsertThread(studentId: string, thread: StudentThread): StudentPortalState {
    const portal = this.findByStudentId(studentId);
    const existingIndex = portal.threads.findIndex((item) => item.id === thread.id);

    if (existingIndex >= 0) {
      portal.threads[existingIndex] = thread;
    } else {
      portal.threads = [thread, ...portal.threads];
    }

    portal.activeThreadId = thread.id;
    return this.save(portal);
  }

  appendClinicalLog(studentId: string, logEntry: ClinicalLogEntry): StudentPortalState {
    const portal = this.findByStudentId(studentId);
    portal.clinicalLogs = [logEntry, ...portal.clinicalLogs];
    return this.save(portal);
  }

  private clone<TValue>(value: TValue): TValue {
    return JSON.parse(JSON.stringify(value)) as TValue;
  }

  private humanizeName(email: string) {
    const nameSource = email.split('@')[0] ?? 'student';

    return nameSource
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private buildStudentNumber(userId: string) {
    const compact = userId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return `CV-S-${compact.slice(0, 6).padEnd(6, '0')}`;
  }
}
