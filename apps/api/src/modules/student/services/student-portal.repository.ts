import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { Injectable, NotFoundException } from '@nestjs/common';

import type { LocalUserRecord } from '../../auth/types/auth-user.types';
import { studentPortalSeed } from '../data/student-portal.seed';
import { CohortsConfigService } from './cohorts-config.service';
import { ExamConfigService } from './exam-config.service';
import { LearningResourcesConfigService } from './learning-resources-config.service';
import {
  ClinicalLogEntry,
  CurriculumModule,
  LearningStep,
  StudentAuditEvent,
  StudentPortalState,
  StudentThread,
} from '../types/student-portal.types';

@Injectable()
export class StudentPortalRepository {
  private readonly storagePath = join(process.cwd(), '.data', 'student-portals.json');
  private readonly portalByStudentId = new Map<string, StudentPortalState>();

  constructor(
    private examConfigService: ExamConfigService,
    private learningResourcesConfigService: LearningResourcesConfigService,
    private cohortsConfigService: CohortsConfigService,
  ) {
    this.loadState();
  }

  findByStudentId(studentId: string): StudentPortalState {
    const portal = this.portalByStudentId.get(studentId);

    if (!portal) {
      throw new NotFoundException(`Student portal state not found for "${studentId}".`);
    }

    return this.enrichPortalWithConfigs(this.clone(portal));
  }

  private enrichPortalWithConfigs(portal: StudentPortalState): StudentPortalState {
    const examConfig = this.examConfigService.getConfig();
    const cohort = portal.profile.cohortId
      ? this.cohortsConfigService.findCohort(portal.profile.cohortId)
      : undefined;
    const modules = this.applyLearningResourcesConfig(portal.modules, undefined, cohort?.moduleIds);
    // Tuition is always the sum of the module fees assigned to the student's registered cohort.
    const cohortFeeTotal = cohort ? this.computeCohortFeeTotal(cohort.moduleIds) : 0;
    const financials = cohort
      ? {
          ...portal.financials,
          totalTuition: cohortFeeTotal,
          balance: Math.max(0, cohortFeeTotal - portal.financials.amountPaid),
        }
      : portal.financials;

    return {
      ...portal,
      intakeJourney: {
        ...portal.intakeJourney,
        entranceExam: examConfig,
      },
      activeModuleId: modules.some((module) => module.id === portal.activeModuleId)
        ? portal.activeModuleId
        : (modules[0]?.id ?? portal.activeModuleId),
      modules,
      financials,
      aiTutorConversations: portal.aiTutorConversations ?? [],
    };
  }

  ensureForLocalUser(localUser: LocalUserRecord): StudentPortalState {
    const existing = this.portalByStudentId.get(localUser.id);
    if (existing) {
      return this.clone(existing);
    }

    const template = studentPortalSeed[0];
    const fullName = this.humanizeName(localUser.email);
    const [firstName = 'Student'] = fullName.split(' ');
    const examConfig = this.examConfigService.getConfig();
    const personalized: StudentPortalState = this.clone({
      ...template,
      profile: {
        ...template.profile,
        id: localUser.id,
        fullName,
        preferredName: firstName,
        email: localUser.email,
        studentNumber: this.buildStudentNumber(localUser.id),
      },
      workflowStage: 'entrance_exam',
      intakeJourney: {
        ...template.intakeJourney,
        entranceExam: examConfig,
        enrollmentWizard: {
          ...template.intakeJourney.enrollmentWizard,
          signatureRequirement: {
            value: fullName,
            hint: `Signature must match ${fullName} to continue.`,
          },
        },
      },
      entranceExam: {
        answers: {},
        score: null,
        totalQuestions: examConfig.questions.length,
        rank: null,
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
        readinessDocumentFiles: {},
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
      modules: this.applyLearningResourcesConfig(undefined, template.modules),
      clinicalLogs: [],
      attendanceRecords: [],
      learningMinutes: 0,
      learningSessionActive: false,
      activeLessonId: undefined,
      lessonElapsedMinutes: {},
      activeLearningAttention: undefined,
      activeExamSession: undefined,
      aiTutorConversations: [],
      textbookIssued: false,
      textbookOpened: false,
      exitSurveyComplete: false,
      reflectionResponse: '',
      questionOfDayAnswer: '',
      lastAction: 'Student portal initialized from authenticated sign-up.',
    });

    this.portalByStudentId.set(localUser.id, personalized);
    this.persistState();
    return this.clone(personalized);
  }

  findAll(): StudentPortalState[] {
    return Array.from(this.portalByStudentId.values()).map((portal) =>
      this.enrichPortalWithConfigs(this.clone(portal)),
    );
  }

  save(portal: StudentPortalState): StudentPortalState {
    this.portalByStudentId.set(portal.profile.id, this.clone(portal));
    this.persistState();
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

  private loadState() {
    if (!existsSync(this.storagePath)) {
      this.loadSeedState();
      return;
    }

    try {
      const raw = readFileSync(this.storagePath, 'utf8');
      const parsed = JSON.parse(raw) as { portals?: StudentPortalState[] };

      this.portalByStudentId.clear();

      (parsed.portals ?? []).forEach((portal) => {
        this.portalByStudentId.set(portal.profile.id, this.clone(portal));
      });

      if (this.portalByStudentId.size === 0) {
        this.loadSeedState();
      }
    } catch {
      this.portalByStudentId.clear();
      this.loadSeedState();
    }
  }

  private loadSeedState() {
    this.portalByStudentId.clear();
    studentPortalSeed.forEach((portal) => {
      this.portalByStudentId.set(portal.profile.id, this.clone(portal));
    });
  }

  private persistState() {
    mkdirSync(join(process.cwd(), '.data'), { recursive: true });
    writeFileSync(
      this.storagePath,
      JSON.stringify(
        {
          portals: Array.from(this.portalByStudentId.values()),
        },
        null,
        2,
      ),
      'utf8',
    );
  }

  private computeCohortFeeTotal(moduleIds: string[]): number {
    const modulesById = new Map(
      this.learningResourcesConfigService.getConfig().modules.map((module) => [module.id, module]),
    );

    return moduleIds.reduce((sum, moduleId) => sum + Math.max(0, modulesById.get(moduleId)?.moduleFee ?? 0), 0);
  }

  private applyLearningResourcesConfig(
    existingModules?: CurriculumModule[],
    fallbackModules?: CurriculumModule[],
    allowedModuleIds?: string[],
  ) {
    const allModules = this.learningResourcesConfigService.getConfig().modules;
    // Students registered into a cohort only receive that cohort's modules.
    const configuredModules =
      allowedModuleIds && allowedModuleIds.length > 0
        ? allModules.filter((module) => allowedModuleIds.includes(module.id))
        : allModules;
    const hasConfig = configuredModules.length > 0;
    const seedModules = fallbackModules ?? [];

    if (!hasConfig) {
      return (existingModules ?? seedModules).map((module) => ({
        ...module,
        steps: module.steps.map((step) => ({ ...step })),
      }));
    }

    return configuredModules.map((configuredModule, moduleIndex) => {
      const existingModule = existingModules?.find((module) => module.id === configuredModule.id);
      const seedModule = seedModules.find((module) => module.id === configuredModule.id);
      const steps = configuredModule.sections.flatMap((section) =>
        section.resources.map<LearningStep>((resource) => {
          const existingStep =
            existingModule?.steps.find((step) => step.id === resource.id) ??
            seedModule?.steps.find((step) => step.id === resource.id);

          return {
            id: resource.id,
            title: resource.title,
            type:
              resource.type === 'video'
                ? 'Video'
                : resource.type === 'pdf'
                  ? 'PDF'
                  : resource.type === 'text'
                    ? 'Reading'
                    : resource.type === 'exam'
                      ? 'Quiz'
                      : 'Link',
            duration: resource.duration,
            note: resource.description,
            complete: existingStep?.complete ?? false,
            resourceUrl: resource.url,
            content: resource.content,
            sectionId: section.id,
            sectionTitle: section.title,
            sectionDescription: section.description,
            examFormat: resource.examFormat,
            passingScore: resource.passingScore,
            questionCount: resource.questionCount,
            questions: resource.questions?.map((question) => ({
              id: question.id,
              prompt: question.prompt,
              points: question.points,
              options: question.options ? [...question.options] : undefined,
            })),
          };
        }),
      );

      const completedSteps = steps.filter((step) => step.complete).length;
      const progressPercent = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

      return {
        id: configuredModule.id,
        title: configuredModule.title,
        summary: configuredModule.summary,
        status: existingModule?.status ?? (moduleIndex === 0 ? 'In Progress' : 'Locked'),
        progressPercent,
        requiredHours: configuredModule.requiredHours,
        completedHours: Math.min(existingModule?.completedHours ?? 0, configuredModule.requiredHours),
        sessionMinutes: Math.min(
          existingModule?.sessionMinutes ?? Math.round((existingModule?.completedHours ?? 0) * 60),
          Math.round(configuredModule.requiredHours * 60),
        ),
        examScore: existingModule?.examScore,
        certificateUnlocked: existingModule?.certificateUnlocked ?? false,
        steps,
      } satisfies CurriculumModule;
    });
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
