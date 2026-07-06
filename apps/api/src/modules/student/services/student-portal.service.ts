import { BadRequestException, Injectable } from '@nestjs/common';

import type { LocalUserRecord } from '../../auth/types/auth-user.types';
import type {
  AdvanceLearningDto,
  AnswerOnboardingQuestionDto,
  AttendanceCheckInDto,
  AttendanceRecord,
  CdphForm,
  ClinicalLogEntry,
  CurriculumModule,
  LogClinicalHoursDto,
  RecordPaymentDto,
  RegisterCohortDto,
  ReplaceStudentDocumentDto,
  ReportAbsenceDto,
  SelectModuleDto,
  StudentCohortsSnapshot,
  SendStudentMessageDto,
  StudentAttendanceSummary,
  StudentAuditEvent,
  StudentCertificatesSummary,
  StudentDashboardSnapshot,
  StudentFormsWorkspace,
  StudentIntakeSnapshot,
  StudentLearningSnapshot,
  StudentPortalState,
  StudentThread,
  SubmitModuleExamDto,
  SubmitModuleExamResponse,
  SubmitSupportTicketDto,
  TextAnswerDto,
  UpdateCdphFormDto,
  UpdateEnrollmentWizardAgreementsDto,
  UpdateEnrollmentWizardDto,
  UpdateOnboardingAcknowledgementsDto,
  UpdateReadinessUploadsDto,
  UpdateSettingDto,
  UpdateStudentProfileDto,
  UpdateWizardStepDto,
  UploadStudentDocumentDto,
} from '../types/student-portal.types';
import { CohortsConfigService } from './cohorts-config.service';
import { ExamConfigService } from './exam-config.service';
import { IntakeSubmissionService } from './intake-submission.service';
import { LearningResourcesConfigService } from './learning-resources-config.service';
import { StudentPortalRepository } from './student-portal.repository';

const CLINICAL_HOURS_REQUIRED = 40;
const EXAM_UNLOCK_MINUTES = 480;

@Injectable()
export class StudentPortalService {
  constructor(
    private readonly repository: StudentPortalRepository,
    private readonly examConfigService: ExamConfigService,
    private readonly intakeSubmissionService: IntakeSubmissionService,
    private readonly learningResourcesConfigService: LearningResourcesConfigService,
    private readonly cohortsConfigService: CohortsConfigService,
  ) {}

  ensurePortalForLocalUser(localUser: LocalUserRecord) {
    return this.repository.ensureForLocalUser(localUser);
  }

  getPortal(studentId: string): StudentPortalState {
    return this.syncWorkflowState(this.repository.findByStudentId(studentId));
  }

  getProfile(studentId: string) {
    return this.repository.findByStudentId(studentId).profile;
  }

  updateProfile(studentId: string, payload: UpdateStudentProfileDto) {
    const portal = this.repository.findByStudentId(studentId);

    if (payload.email && !payload.email.includes('@')) {
      throw new BadRequestException('A valid email address is required.');
    }

    portal.profile = {
      ...portal.profile,
      ...this.trimStringFields({ ...payload }),
    };
    this.recordAudit(portal, 'student.profile.updated', portal.profile.id, { ...payload });
    return this.repository.save(portal).profile;
  }

  getCohorts(studentId: string): StudentCohortsSnapshot {
    const portal = this.repository.findByStudentId(studentId);
    const moduleTitleById = new Map(
      this.learningResourcesConfigService.getConfig().modules.map((module) => [module.id, module.title]),
    );
    const registeredCohort = portal.profile.cohortId
      ? this.cohortsConfigService.findCohort(portal.profile.cohortId)
      : undefined;

    return {
      registeredCohortId: portal.profile.cohortId ?? null,
      registeredCohortName:
        registeredCohort?.name ?? (portal.profile.cohortId ? portal.profile.cohort : null),
      cohorts: this.cohortsConfigService
        .getConfig()
        .cohorts.filter((cohort) => cohort.isOpen)
        .map((cohort) => ({
          id: cohort.id,
          name: cohort.name,
          description: cohort.description,
          feeAmount: cohort.feeAmount,
          moduleCount: cohort.moduleIds.length,
          moduleTitles: cohort.moduleIds
            .map((moduleId) => moduleTitleById.get(moduleId))
            .filter((title): title is string => Boolean(title)),
        })),
    };
  }

  registerCohort(studentId: string, payload: RegisterCohortDto): StudentCohortsSnapshot {
    const cohortId = payload.cohortId?.trim();

    if (!cohortId) {
      throw new BadRequestException('A cohortId is required to register.');
    }

    const cohort = this.cohortsConfigService.findCohort(cohortId);

    if (!cohort) {
      throw new BadRequestException(`Cohort "${cohortId}" was not found.`);
    }

    if (!cohort.isOpen) {
      throw new BadRequestException(`Cohort "${cohort.name}" is not open for registration.`);
    }

    const portal = this.repository.findByStudentId(studentId);
    portal.profile = {
      ...portal.profile,
      cohortId: cohort.id,
      cohort: cohort.name,
    };

    if (cohort.feeAmount > 0) {
      portal.financials = {
        ...portal.financials,
        totalTuition: cohort.feeAmount,
        balance: Math.max(0, cohort.feeAmount - portal.financials.amountPaid),
      };
    }

    this.recordAudit(portal, 'student.cohort.registered', cohort.id, {
      cohortName: cohort.name,
      feeAmount: cohort.feeAmount,
    });
    this.repository.save(portal);
    return this.getCohorts(studentId);
  }

  getDashboard(studentId: string): StudentDashboardSnapshot {
    const portal = this.syncWorkflowState(this.repository.findByStudentId(studentId));
    const currentModule = this.getCurrentModule(portal);
    const completedOnboardingCount = portal.onboarding.steps.filter((step) => step.complete).length;
    const unreadCount = this.getUnreadCount(portal);
    const overallProgressPercent = this.getOverallProgressPercent(portal);

    return {
      profile: portal.profile,
      workflowStage: portal.workflowStage,
      metrics: [
        {
          id: 'overall-progress',
          label: 'Overall Progress',
          value: `${overallProgressPercent}%`,
          current: this.getTheoryHoursCompleted(portal) + this.getClinicalHoursCompleted(portal),
          target: this.getTheoryHoursRequired(portal) + CLINICAL_HOURS_REQUIRED,
          unit: 'hours',
        },
        {
          id: 'theory-hours',
          label: 'Theory Hours',
          value: `${this.getTheoryHoursCompleted(portal)}/${this.getTheoryHoursRequired(portal)}`,
          current: this.getTheoryHoursCompleted(portal),
          target: this.getTheoryHoursRequired(portal),
          unit: 'hours',
        },
        {
          id: 'clinical-hours',
          label: 'Clinical Hours',
          value: `${this.getClinicalHoursCompleted(portal)}/${CLINICAL_HOURS_REQUIRED}`,
          current: this.getClinicalHoursCompleted(portal),
          target: CLINICAL_HOURS_REQUIRED,
          unit: 'hours',
        },
        {
          id: 'unread',
          label: 'Unread Messages',
          value: String(unreadCount),
          current: unreadCount,
          target: portal.threads.length,
        },
      ],
      currentModule,
      tasks: portal.tasks,
      upcomingSessions: portal.clinicalSessions,
      unreadCount,
      completedOnboardingCount,
      onboardingStepCount: portal.onboarding.steps.length,
      overallProgressPercent,
    };
  }

  getIntake(studentId: string): StudentIntakeSnapshot {
    const portal = this.syncWorkflowState(this.repository.findByStudentId(studentId));
    return {
      workflowStage: portal.workflowStage,
      intakeJourney: portal.intakeJourney,
      entranceExam: portal.entranceExam,
      enrollmentWizard: portal.enrollmentWizard,
      entranceSurvey: portal.entranceSurvey,
    };
  }

  setWorkflowStage(studentId: string, workflowStage: StudentPortalState['workflowStage']) {
    if (['enrollment_wizard', 'orientation_survey', 'active'].includes(workflowStage)) {
      this.assertStudentApproved(studentId);
    }

    const portal = this.repository.findByStudentId(studentId);
    portal.workflowStage = workflowStage;
    portal.onboarding.workflowStage = workflowStage;
    portal.lastAction = `Workflow stage updated to ${workflowStage.replaceAll('_', ' ')}.`;
    this.recordAudit(portal, 'student.intake.workflow-stage.updated', 'workflow-stage', {
      workflowStage,
    });
    return this.repository.save(portal).workflowStage;
  }

  answerEntranceExamQuestion(studentId: string, questionId: string, payload: TextAnswerDto) {
    if (!payload.answer.trim()) {
      throw new BadRequestException('Entrance exam answers cannot be empty.');
    }

    this.assertEntranceExamEditable(studentId);

    const portal = this.repository.findByStudentId(studentId);
    portal.entranceExam.answers[questionId] = payload.answer.trim();
    portal.lastAction = 'Entrance exam response saved.';
    this.recordAudit(portal, 'student.intake.entrance-exam.answer.updated', questionId, {
      questionId,
    });
    return this.repository.save(portal).entranceExam;
  }

  submitEntranceExam(studentId: string) {
    const portal = this.repository.findByStudentId(studentId);
    const examConfig = this.examConfigService.getConfig();
    const unansweredQuestion = examConfig.questions.find(
      (question) => (portal.entranceExam.answers[question.id] ?? '').trim().length === 0,
    );

    if (unansweredQuestion) {
      throw new BadRequestException(`Question "${unansweredQuestion.prompt}" must be answered before submission.`);
    }

    const submittedAt = new Date().toISOString();

    portal.entranceExam = {
      ...portal.entranceExam,
      score: null,
      totalQuestions: examConfig.questions.length,
      rank: null,
      taken: true,
      passed: false,
      submittedAt,
    };
    portal.workflowStage = 'admin_review';
    portal.onboarding.workflowStage = 'admin_review';
    portal.lastAction = 'Entrance exam submitted for admin review.';

    this.intakeSubmissionService.submitIntake(studentId, {
      entranceExamScore: null,
      entranceExamPassed: null,
      passingScore: examConfig.passingScore,
      questions: examConfig.questions.map((question) => ({
        questionId: question.id,
        prompt: question.prompt,
        type: question.type,
        preferredAnswer: question.preferredAnswer,
        options: question.options,
        studentAnswer: portal.entranceExam.answers[question.id]?.trim() ?? '',
        reviewStatus: 'pending',
      })),
      enrollmentData: portal.enrollmentWizard,
    });

    this.recordAudit(portal, 'student.intake.entrance-exam.submitted', 'entrance-exam', {
      reviewed: false,
      totalQuestions: examConfig.questions.length,
    });
    return this.repository.save(portal).entranceExam;
  }

  updateEnrollmentWizard(studentId: string, payload: UpdateEnrollmentWizardDto) {
    this.assertStudentApproved(studentId);
    const portal = this.repository.findByStudentId(studentId);
    portal.enrollmentWizard = {
      ...portal.enrollmentWizard,
      ...this.trimStringFields({ ...payload }),
    };
    portal.lastAction = 'Enrollment wizard updated.';
    this.recordAudit(portal, 'student.intake.enrollment-wizard.updated', 'enrollment-wizard', {
      ...payload,
    });
    return this.repository.save(portal).enrollmentWizard;
  }

  updateEnrollmentWizardAgreements(studentId: string, payload: UpdateEnrollmentWizardAgreementsDto) {
    this.assertStudentApproved(studentId);
    const portal = this.repository.findByStudentId(studentId);
    portal.enrollmentWizard.agreements = {
      ...portal.enrollmentWizard.agreements,
      ...payload,
    };
    portal.lastAction = 'Enrollment agreement acknowledgement updated.';
    this.recordAudit(portal, 'student.intake.enrollment-wizard.agreements.updated', 'enrollment-wizard', {
      ...payload,
    });
    return this.repository.save(portal).enrollmentWizard;
  }

  setEnrollmentWizardStep(studentId: string, payload: UpdateWizardStepDto) {
    this.assertStudentApproved(studentId);
    const portal = this.repository.findByStudentId(studentId);
    const maxStep = portal.intakeJourney.enrollmentWizard.steps.length;
    portal.enrollmentWizard.step = Math.min(maxStep, Math.max(1, payload.step));
    return this.repository.save(portal).enrollmentWizard;
  }

  submitEnrollmentWizard(studentId: string) {
    this.assertStudentApproved(studentId);
    const portal = this.repository.findByStudentId(studentId);
    const allAgreementsAccepted = Object.values(portal.enrollmentWizard.agreements).every(Boolean);
    const hasSignature = portal.enrollmentWizard.signature.trim().length > 0;
    const requiredSignature = portal.intakeJourney.enrollmentWizard.signatureRequirement.value.trim().toLowerCase();
    const hasScrubs =
      portal.enrollmentWizard.scrubTop.trim().length > 0 && portal.enrollmentWizard.scrubBottom.trim().length > 0;
    const hasTestingPreference = portal.enrollmentWizard.wantsToTestAtDaisy !== null;

    if (!allAgreementsAccepted || !hasSignature || !hasScrubs || !hasTestingPreference) {
      throw new BadRequestException(
        'Enrollment wizard is incomplete. Agreements, scrub selections, signature, and test preference are required.',
      );
    }

    if (portal.enrollmentWizard.signature.trim().toLowerCase() !== requiredSignature) {
      throw new BadRequestException('Enrollment signature does not match the required signer.');
    }

    portal.enrollmentWizard.submitted = true;
    portal.enrollmentWizard.step = portal.intakeJourney.enrollmentWizard.steps.length;
    portal.workflowStage = 'orientation_survey';
    portal.onboarding.workflowStage = 'orientation_survey';
    portal.lastAction = 'Enrollment package submitted. Orientation survey unlocked.';
    this.recordAudit(portal, 'student.intake.enrollment-wizard.submitted', 'enrollment-wizard', {
      submitted: true,
    });
    return this.repository.save(portal).enrollmentWizard;
  }

  answerEntranceSurveyQuestion(studentId: string, questionId: string, payload: TextAnswerDto) {
    if (!payload.answer.trim()) {
      throw new BadRequestException('Entrance survey answers cannot be empty.');
    }

    this.assertStudentApproved(studentId);

    const portal = this.repository.findByStudentId(studentId);
    portal.entranceSurvey.answers[questionId] = payload.answer.trim();
    portal.lastAction = 'Orientation survey answer saved.';
    this.recordAudit(portal, 'student.intake.entrance-survey.answer.updated', questionId, {
      questionId,
    });
    return this.repository.save(portal).entranceSurvey;
  }

  setEntranceSurveyStep(studentId: string, payload: UpdateWizardStepDto) {
    this.assertStudentApproved(studentId);
    const portal = this.repository.findByStudentId(studentId);
    const maxStep = portal.intakeJourney.orientationSurvey.sections.length;
    portal.entranceSurvey.step = Math.min(maxStep, Math.max(1, payload.step));
    return this.repository.save(portal).entranceSurvey;
  }

  submitEntranceSurvey(studentId: string) {
    this.assertStudentApproved(studentId);
    const portal = this.repository.findByStudentId(studentId);
    const answeredCount = Object.values(portal.entranceSurvey.answers).filter((value) => value.trim().length > 0).length;

    if (answeredCount === 0) {
      throw new BadRequestException('At least one orientation survey response is required before submission.');
    }

    portal.entranceSurvey.completed = true;
    portal.entranceSurvey.step = portal.intakeJourney.orientationSurvey.sections.length;
    portal.workflowStage = 'active';
    portal.tasks = portal.tasks.map((task) =>
      task.id === 'entrance-survey' ? { ...task, complete: true } : task,
    );
    portal.lastAction = 'Orientation survey completed. Student portal unlocked.';
    this.recordAudit(portal, 'student.intake.entrance-survey.submitted', 'entrance-survey', {
      answers: answeredCount,
    });
    return this.repository.save(portal).entranceSurvey;
  }

  getOnboarding(studentId: string) {
    return this.repository.findByStudentId(studentId).onboarding;
  }

  toggleTask(studentId: string, taskId: string) {
    const portal = this.repository.findByStudentId(studentId);
    portal.tasks = portal.tasks.map((task) =>
      task.id === taskId ? { ...task, complete: !task.complete } : task,
    );
    portal.lastAction = 'Task checklist updated.';
    this.recordAudit(portal, 'student.task.toggled', taskId);
    return this.repository.save(portal).tasks;
  }

  toggleOnboardingStep(studentId: string, stepId: string) {
    const portal = this.repository.findByStudentId(studentId);
    portal.onboarding.steps = portal.onboarding.steps.map((step) =>
      step.id === stepId ? { ...step, complete: !step.complete } : step,
    );
    portal.lastAction = 'Onboarding checklist progress refreshed.';
    this.recordAudit(portal, 'student.onboarding.step.toggled', stepId);
    return this.repository.save(portal).onboarding;
  }

  answerOnboardingQuestion(studentId: string, questionId: string, payload: AnswerOnboardingQuestionDto) {
    if (!payload.answer.trim()) {
      throw new BadRequestException('Onboarding answers cannot be empty.');
    }

    const portal = this.repository.findByStudentId(studentId);
    const question = portal.onboarding.questions.find((item) => item.id === questionId);

    if (!question) {
      throw new BadRequestException(`Onboarding question "${questionId}" was not found.`);
    }

    question.answer = payload.answer.trim();
    portal.lastAction = 'Onboarding response saved.';
    this.recordAudit(portal, 'student.onboarding.question.updated', questionId, { questionId });
    return this.repository.save(portal).onboarding;
  }

  updateOnboardingAcknowledgements(studentId: string, payload: UpdateOnboardingAcknowledgementsDto) {
    const portal = this.repository.findByStudentId(studentId);
    portal.onboarding.acknowledgements = {
      ...portal.onboarding.acknowledgements,
      ...payload,
    };

    if (Object.values(portal.onboarding.acknowledgements).every(Boolean)) {
      portal.onboarding.steps = portal.onboarding.steps.map((step) =>
        step.id === 'orientation' ? { ...step, complete: true, actionLabel: 'Reviewed' } : step,
      );
    }

    portal.lastAction = 'Orientation acknowledgements updated.';
    this.recordAudit(portal, 'student.onboarding.acknowledgements.updated', 'onboarding', {
      ...payload,
    });
    return this.repository.save(portal).onboarding;
  }

  updateReadinessUploads(studentId: string, payload: UpdateReadinessUploadsDto) {
    const portal = this.repository.findByStudentId(studentId);
    portal.onboarding.readinessUploads = {
      ...portal.onboarding.readinessUploads,
      ...payload,
    };
    portal.lastAction = 'Readiness upload status updated.';
    this.recordAudit(portal, 'student.onboarding.readiness.updated', 'onboarding', {
      ...payload,
    });
    return this.repository.save(portal).onboarding;
  }

  submitOnboarding(studentId: string) {
    const portal = this.repository.findByStudentId(studentId);
    const allQuestionsAnswered = portal.onboarding.questions.every((question) => question.answer.trim().length > 0);
    const acknowledgementsComplete = Object.values(portal.onboarding.acknowledgements).every(Boolean);
    const readinessComplete = Object.values(portal.onboarding.readinessUploads).every(Boolean);

    if (!allQuestionsAnswered || !acknowledgementsComplete || !readinessComplete) {
      throw new BadRequestException(
        'Onboarding is incomplete. Questions, acknowledgements, and readiness uploads must all be complete before submission.',
      );
    }

    portal.onboarding.submitted = true;
    portal.onboarding.steps = portal.onboarding.steps.map((step) => ({
      ...step,
      complete: true,
      actionLabel: 'Complete',
    }));
    portal.workflowStage = 'admin_review';
    portal.onboarding.workflowStage = 'admin_review';
    portal.lastAction = 'Onboarding package submitted to admissions review.';
    this.recordAudit(portal, 'student.onboarding.submitted', 'onboarding', { submitted: true });
    return this.repository.save(portal).onboarding;
  }

  getCurriculum(studentId: string) {
    const portal = this.repository.findByStudentId(studentId);
    return {
      activeModuleId: portal.activeModuleId,
      modules: portal.modules,
    };
  }

  getLearning(studentId: string): StudentLearningSnapshot {
    const portal = this.repository.findByStudentId(studentId);

    return {
      activeModuleId: portal.activeModuleId,
      currentModule: this.getCurrentModule(portal),
      modules: portal.modules,
      learningMinutes: portal.learningMinutes,
      learningSessionActive: portal.learningSessionActive,
      examUnlocked: portal.learningMinutes >= EXAM_UNLOCK_MINUTES,
      textbookIssued: portal.textbookIssued,
      textbookOpened: portal.textbookOpened,
      exitSurveyComplete: portal.exitSurveyComplete,
      moduleCertificatesReady: this.getModuleCertificatesReady(portal),
      programCertificateReady: this.getProgramCertificateReady(portal),
    };
  }

  advanceLearning(studentId: string, payload: AdvanceLearningDto) {
    const portal = this.repository.findByStudentId(studentId);
    const minutes = payload.minutes ?? 30;

    if (minutes <= 0) {
      throw new BadRequestException('Learning minutes must be greater than zero.');
    }

    portal.learningMinutes = Math.min(portal.learningMinutes + minutes, EXAM_UNLOCK_MINUTES);
    const activeIndex = portal.modules.findIndex((module) => module.id === portal.activeModuleId);
    const activeModule = portal.modules[activeIndex];

    if (!activeModule) {
      throw new BadRequestException('Active learning module was not found.');
    }

    portal.modules[activeIndex] = this.recalculateModule({
      ...activeModule,
      steps: [...activeModule.steps],
    });

    if (portal.learningMinutes >= EXAM_UNLOCK_MINUTES) {
      portal.tasks = portal.tasks.map((task) =>
        task.id === 'theory-hours' ? { ...task, complete: true } : task,
      );
    }

    portal.lastAction =
      portal.learningMinutes >= EXAM_UNLOCK_MINUTES
        ? 'Module exam unlocked after required engagement time.'
        : 'Learning progress advanced.';

    this.recordAudit(portal, 'student.learning.advanced', portal.activeModuleId, { minutes });
    return this.repository.save(portal).modules;
  }

  toggleLearningSession(studentId: string) {
    const portal = this.repository.findByStudentId(studentId);
    portal.learningSessionActive = !portal.learningSessionActive;
    portal.lastAction = portal.learningSessionActive ? 'Learning session resumed.' : 'Learning session paused.';
    this.recordAudit(portal, 'student.learning.session.toggled', portal.activeModuleId, {
      active: portal.learningSessionActive,
    });
    return this.repository.save(portal).learningSessionActive;
  }

  selectModule(studentId: string, payload: SelectModuleDto) {
    const portal = this.repository.findByStudentId(studentId);
    const module = portal.modules.find((item) => item.id === payload.moduleId);

    if (!module) {
      throw new BadRequestException(`Module "${payload.moduleId}" was not found.`);
    }

    portal.activeModuleId = payload.moduleId;
    portal.lastAction = 'Learning viewer switched to a different module.';
    return this.repository.save(portal).activeModuleId;
  }

  toggleModuleStep(studentId: string, moduleId: string, stepId: string) {
    const portal = this.repository.findByStudentId(studentId);
    portal.modules = portal.modules.map((module) => {
      if (module.id !== moduleId) {
        return module;
      }

      if (module.status === 'Locked') {
        throw new BadRequestException('Locked modules cannot be progressed yet.');
      }

      return this.recalculateModule({
        ...module,
        steps: module.steps.map((step) =>
          step.id === stepId ? { ...step, complete: !step.complete } : step,
        ),
      });
    });

    portal.lastAction = 'Module activity status updated.';
    this.recordAudit(portal, 'student.learning.step.toggled', stepId, { moduleId });
    return this.repository.save(portal).modules.find((module) => module.id === moduleId);
  }

  submitModuleExam(studentId: string, moduleId: string, payload?: SubmitModuleExamDto): SubmitModuleExamResponse {
    const portal = this.repository.findByStudentId(studentId);
    const activeIndex = portal.modules.findIndex((module) => module.id === moduleId);

    if (activeIndex === -1) {
      throw new BadRequestException(`Module "${moduleId}" was not found.`);
    }

    const activeModule = portal.modules[activeIndex];

    if (activeModule.status === 'Locked') {
      throw new BadRequestException('Locked modules cannot be submitted.');
    }

    const allLearningStepsComplete = activeModule.steps
      .filter((step) => step.type !== 'Quiz')
      .every((step) => step.complete);

    if (!allLearningStepsComplete) {
      throw new BadRequestException('Complete all module learning steps before submitting the exam.');
    }

    const result = this.gradeModuleExam(moduleId, payload);

    if (!result.passed) {
      portal.lastAction = `${activeModule.title} exam attempted — score below the passing threshold.`;
      this.recordAudit(portal, 'student.learning.module-exam.failed', moduleId, {
        scorePercent: result.scorePercent,
        passingScore: result.passingScore,
      });
      return { module: this.repository.save(portal).modules[activeIndex], result };
    }

    portal.modules[activeIndex] = this.recalculateModule({
      ...activeModule,
      status: 'Complete',
      examScore: `${result.scorePercent}/100`,
      certificateUnlocked: true,
      steps: activeModule.steps.map((step) => ({ ...step, complete: true })),
    });

    const nextModule = portal.modules[activeIndex + 1];
    if (nextModule && nextModule.status === 'Locked') {
      portal.modules[activeIndex + 1] = {
        ...nextModule,
        status: 'In Progress',
      };
      portal.activeModuleId = nextModule.id;
    }

    portal.lastAction = `${activeModule.title} exam passed and certificate unlocked.`;
    this.recordAudit(portal, 'student.learning.module-exam.submitted', moduleId, {
      scorePercent: result.scorePercent,
    });
    return { module: this.repository.save(portal).modules[activeIndex], result };
  }

  private gradeModuleExam(moduleId: string, payload?: SubmitModuleExamDto) {
    const configuredModule = this.learningResourcesConfigService
      .getConfig()
      .modules.find((module) => module.id === moduleId);
    const examResources = (configuredModule?.sections ?? [])
      .flatMap((section) => section.resources)
      .filter((resource) => resource.type === 'exam');
    const examResource = payload?.stepId
      ? examResources.find((resource) => resource.id === payload.stepId)
      : examResources[0];
    const questions = examResource?.questions ?? [];

    if (questions.length === 0) {
      // No authored questions — treat the assessment as a simple completion checkpoint.
      return {
        graded: false,
        passed: true,
        scorePercent: 100,
        earnedPoints: 0,
        totalPoints: 0,
        passingScore: examResource?.passingScore ?? 0,
        correctCount: 0,
        totalQuestions: 0,
      };
    }

    const answers = payload?.answers ?? {};
    let earnedPoints = 0;
    let totalPoints = 0;
    let correctCount = 0;

    questions.forEach((question) => {
      const points = question.points > 0 ? question.points : 1;
      totalPoints += points;
      const answer = (answers[question.id] ?? '').trim();

      const isCorrect =
        question.options && question.options.length > 0 && typeof question.correctOption === 'number'
          ? Number(answer) === question.correctOption
          : question.expectedAnswer
            ? answer.toLowerCase() === question.expectedAnswer.trim().toLowerCase()
            : answer.length > 0;

      if (isCorrect) {
        earnedPoints += points;
        correctCount += 1;
      }
    });

    const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passingScore = examResource?.passingScore ?? 70;

    return {
      graded: true,
      passed: scorePercent >= passingScore,
      scorePercent,
      earnedPoints,
      totalPoints,
      passingScore,
      correctCount,
      totalQuestions: questions.length,
    };
  }

  openTextbook(studentId: string) {
    const portal = this.repository.findByStudentId(studentId);
    portal.textbookIssued = true;
    portal.textbookOpened = true;
    portal.lastAction = 'Digital textbook access logged.';
    this.recordAudit(portal, 'student.learning.textbook.opened', 'textbook');
    return this.repository.save(portal).textbookOpened;
  }

  completeExitSurvey(studentId: string) {
    const portal = this.repository.findByStudentId(studentId);
    portal.exitSurveyComplete = true;
    portal.lastAction = 'Exit survey completed.';
    this.recordAudit(portal, 'student.learning.exit-survey.completed', 'exit-survey');
    return this.repository.save(portal).exitSurveyComplete;
  }

  getProgress(studentId: string) {
    const portal = this.repository.findByStudentId(studentId);
    return {
      completedModules: portal.modules.filter((module) => module.status === 'Complete').length,
      totalModules: portal.modules.length,
      unlockedCertificates: this.getModuleCertificatesReady(portal),
      totalClinicalHours: this.getClinicalHoursCompleted(portal),
      modules: portal.modules,
      clinicalLogs: portal.clinicalLogs,
      auditTrail: portal.auditTrail,
    };
  }

  getMessages(studentId: string) {
    const portal = this.repository.findByStudentId(studentId);
    return {
      activeThreadId: portal.activeThreadId,
      threads: portal.threads,
      unreadCount: this.getUnreadCount(portal),
    };
  }

  selectThread(studentId: string, threadId: string) {
    const portal = this.repository.findByStudentId(studentId);
    const exists = portal.threads.some((thread) => thread.id === threadId);

    if (!exists) {
      throw new BadRequestException(`Message thread "${threadId}" was not found.`);
    }

    portal.activeThreadId = threadId;
    portal.threads = portal.threads.map((thread) =>
      thread.id === threadId ? { ...thread, unread: false, status: 'Read' } : thread,
    );
    portal.lastAction = 'Inbox conversation switched.';
    this.recordAudit(portal, 'student.message.thread.selected', threadId);
    return this.repository.save(portal).threads.find((thread) => thread.id === threadId);
  }

  sendMessage(studentId: string, payload: SendStudentMessageDto) {
    if (!payload.text.trim()) {
      throw new BadRequestException('Message text cannot be empty.');
    }

    const portal = this.repository.findByStudentId(studentId);
    const now = new Date().toISOString();
    const threadId = payload.threadId?.trim() || this.slugify(`${payload.recipientName}-${payload.moduleId}`);
    const message = {
      id: `msg-${Date.now()}`,
      sender: 'student' as const,
      text: payload.text.trim(),
      time: now,
    };

    const existingThread = portal.threads.find((item) => item.id === threadId);
    const nextThread: StudentThread = existingThread
      ? {
          ...existingThread,
          status: 'Read',
          unread: false,
          preview: message.text,
          time: now,
          messages: [...existingThread.messages, message],
        }
      : {
          id: threadId,
          recipientName: payload.recipientName,
          recipientRole: payload.recipientRole,
          moduleId: payload.moduleId,
          moduleName: payload.moduleName,
          status: 'Read',
          preview: message.text,
          time: now,
          unread: false,
          messages: [message],
        };

    const saved = this.repository.upsertThread(studentId, nextThread);
    saved.lastAction = `Reply sent to ${nextThread.recipientName}.`;
    this.recordAudit(saved, 'student.message.sent', nextThread.id, { moduleId: payload.moduleId });
    return this.repository.save(saved).threads.find((thread) => thread.id === nextThread.id);
  }

  getClinicalHours(studentId: string) {
    const portal = this.repository.findByStudentId(studentId);
    return {
      requiredHours: CLINICAL_HOURS_REQUIRED,
      completedHours: this.getClinicalHoursCompleted(portal),
      sessions: portal.clinicalSessions,
      logs: portal.clinicalLogs,
    };
  }

  logClinicalHours(studentId: string, payload: LogClinicalHoursDto) {
    if (payload.hours <= 0) {
      throw new BadRequestException('Clinical log hours must be greater than zero.');
    }

    const portal = this.repository.findByStudentId(studentId);
    const logEntry: ClinicalLogEntry = {
      id: `log-${Date.now()}`,
      date: payload.date,
      moduleId: payload.moduleId,
      moduleTitle: payload.moduleTitle,
      hours: payload.hours,
      instructor: payload.instructor,
      note: payload.note?.trim(),
      status: 'Pending',
    };

    portal.clinicalLogs = [logEntry, ...portal.clinicalLogs];
    portal.tasks = portal.tasks.map((task) =>
      task.id === 'clinical-log' ? { ...task, complete: true } : task,
    );
    portal.lastAction = 'Clinical practice session logged and sent for verification.';
    this.recordAudit(portal, 'student.clinical-log.created', logEntry.id, {
      moduleId: payload.moduleId,
      hours: payload.hours,
    });
    return this.repository.save(portal).clinicalLogs[0];
  }

  getAttendance(studentId: string): StudentAttendanceSummary {
    const portal = this.repository.findByStudentId(studentId);
    const today = this.formatIsoDay();

    return {
      todayTheoryCheckedIn: portal.attendanceRecords.some(
        (record) => record.date === today && record.type === 'Theory' && record.status === 'Present',
      ),
      todayClinicalCheckedIn: portal.attendanceRecords.some(
        (record) => record.date === today && record.type === 'Clinical' && record.status === 'Present',
      ),
      records: portal.attendanceRecords,
    };
  }

  checkIn(studentId: string, payload: AttendanceCheckInDto) {
    const portal = this.repository.findByStudentId(studentId);
    const today = this.formatIsoDay();
    const nextRecord: AttendanceRecord = {
      id: `${payload.type}-${Date.now()}`,
      date: today,
      type: payload.type,
      status: 'Present',
      note: `${payload.type} session check-in captured.`,
    };

    portal.attendanceRecords = [
      nextRecord,
      ...portal.attendanceRecords.filter(
        (record) => !(record.date === today && record.type === payload.type),
      ),
    ];
    portal.lastAction = `${payload.type} attendance check-in recorded for today.`;
    this.recordAudit(portal, 'student.attendance.checked-in', nextRecord.id, { type: payload.type });
    return this.repository.save(portal).attendanceRecords[0];
  }

  reportAbsence(studentId: string, payload: ReportAbsenceDto) {
    const portal = this.repository.findByStudentId(studentId);
    const nextRecord: AttendanceRecord = {
      id: `absence-${Date.now()}`,
      date: this.formatIsoDay(payload.kind === 'future' ? 1 : 0),
      type: 'Theory',
      status: payload.kind === 'today' ? 'Unplanned Absence' : 'Planned Absence',
      note: payload.kind === 'today' ? 'Illness reported to support staff.' : 'Planned absence submitted for approval.',
    };

    portal.attendanceRecords = [nextRecord, ...portal.attendanceRecords];
    portal.lastAction =
      payload.kind === 'today'
        ? 'An unplanned absence was submitted for today.'
        : 'A planned absence was submitted for the next session.';
    this.recordAudit(portal, 'student.attendance.absence.reported', nextRecord.id, {
      kind: payload.kind,
    });
    return this.repository.save(portal).attendanceRecords[0];
  }

  submitReflection(studentId: string, payload: TextAnswerDto) {
    if (!payload.answer.trim()) {
      throw new BadRequestException('Reflection text cannot be empty.');
    }

    const portal = this.repository.findByStudentId(studentId);
    portal.reflectionResponse = payload.answer.trim();
    portal.lastAction = 'Daily reflection submitted.';
    this.recordAudit(portal, 'student.reflection.submitted', 'reflection');
    return this.repository.save(portal).reflectionResponse;
  }

  submitQuestionAnswer(studentId: string, payload: TextAnswerDto) {
    if (!payload.answer.trim()) {
      throw new BadRequestException('Question response cannot be empty.');
    }

    const portal = this.repository.findByStudentId(studentId);
    portal.questionOfDayAnswer = payload.answer.trim();
    portal.lastAction = 'Question-of-the-day response recorded.';
    this.recordAudit(portal, 'student.question-of-day.submitted', 'question-of-day');
    return this.repository.save(portal).questionOfDayAnswer;
  }

  getFinancials(studentId: string) {
    return this.repository.findByStudentId(studentId).financials;
  }

  recordPayment(studentId: string, payload: RecordPaymentDto) {
    if (payload.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero.');
    }

    const portal = this.repository.findByStudentId(studentId);
    if (payload.amount > portal.financials.balance) {
      throw new BadRequestException('Payment amount cannot exceed the remaining balance.');
    }

    portal.financials.amountPaid += payload.amount;
    portal.financials.balance -= payload.amount;
    portal.financials.status = 'Current';
    portal.financials.paymentPlan = [
      {
        id: `pay-${Date.now()}`,
        date: payload.date ?? new Date().toISOString().slice(0, 10),
        amount: payload.amount,
        status: 'Completed',
        method: payload.method.trim(),
      },
      ...portal.financials.paymentPlan,
    ];
    portal.onboarding.steps = portal.onboarding.steps.map((step) =>
      step.id === 'billing' ? { ...step, complete: portal.financials.balance === 0, actionLabel: 'Reviewed' } : step,
    );
    portal.lastAction = `Payment recorded for ${payload.date ?? 'today'}.`;
    this.recordAudit(portal, 'student.payment.recorded', 'financials', {
      amount: payload.amount,
      method: payload.method.trim(),
    });
    return this.repository.save(portal).financials;
  }

  completeNextScheduledPayment(studentId: string) {
    const portal = this.repository.findByStudentId(studentId);
    const nextPayment = [...portal.financials.paymentPlan]
      .reverse()
      .find((payment) => payment.status === 'Upcoming');

    if (!nextPayment) {
      throw new BadRequestException('There are no upcoming scheduled payments remaining.');
    }

    return this.recordPayment(studentId, {
      amount: nextPayment.amount,
      method: nextPayment.method,
      date: nextPayment.date,
    });
  }

  getDocuments(studentId: string) {
    const portal = this.repository.findByStudentId(studentId);
    return {
      items: portal.documents,
      requiredCount: portal.documents.filter((document) => document.required).length,
      verifiedCount: portal.documents.filter((document) => document.status === 'Verified').length,
      moduleCertificatesReady: this.getModuleCertificatesReady(portal),
      programCertificateReady: this.getProgramCertificateReady(portal),
    };
  }

  uploadDocument(studentId: string, payload: UploadStudentDocumentDto) {
    if (!payload.title.trim() || !payload.subtitle.trim()) {
      throw new BadRequestException('Document title and subtitle are required.');
    }

    const portal = this.repository.findByStudentId(studentId);
    const document = {
      id: this.slugify(`${payload.title}-${Date.now()}`),
      title: payload.title.trim(),
      category: payload.category,
      subtitle: payload.subtitle.trim(),
      status: payload.status ?? 'Pending Review',
      submittedAt: payload.submittedAt ?? new Date().toISOString().slice(0, 10),
      required: payload.required ?? true,
      fileName: payload.fileName?.trim(),
    };

    portal.documents = [document, ...portal.documents];
    portal.lastAction = 'A new document was added to the student record.';
    this.recordAudit(portal, 'student.document.uploaded', document.id, { category: payload.category });
    return this.repository.save(portal).documents[0];
  }

  replaceDocument(studentId: string, documentId: string, payload: ReplaceStudentDocumentDto) {
    const portal = this.repository.findByStudentId(studentId);
    const target = portal.documents.find((document) => document.id === documentId);

    if (!target) {
      throw new BadRequestException(`Document "${documentId}" was not found.`);
    }

    target.status = 'Pending Review';
    target.submittedAt = new Date().toISOString().slice(0, 10);
    if (payload.subtitle?.trim()) {
      target.subtitle = payload.subtitle.trim();
    }
    if (payload.fileName?.trim()) {
      target.fileName = payload.fileName.trim();
    }

    portal.lastAction = 'A document replacement was staged for review.';
    this.recordAudit(portal, 'student.document.replaced', documentId);
    return this.repository.save(portal).documents.find((document) => document.id === documentId);
  }

  getForms(studentId: string): StudentFormsWorkspace {
    const portal = this.repository.findByStudentId(studentId);
    return {
      forms: portal.forms,
      cdphForm: portal.cdphForm,
      cdphSigned: portal.cdphSigned,
      liveScanGenerated: portal.liveScanGenerated,
      liveScanUploaded: portal.liveScanUploaded,
    };
  }

  generateLiveScan(studentId: string) {
    const portal = this.repository.findByStudentId(studentId);
    portal.liveScanGenerated = true;
    portal.lastAction = 'Live Scan form generated.';
    this.recordAudit(portal, 'student.form.live-scan.generated', 'live-scan');
    return this.repository.save(portal).liveScanGenerated;
  }

  toggleLiveScanUpload(studentId: string) {
    const portal = this.repository.findByStudentId(studentId);
    portal.liveScanUploaded = !portal.liveScanUploaded;
    portal.lastAction = portal.liveScanUploaded
      ? 'Live Scan receipt uploaded to the student record.'
      : 'Live Scan upload removed.';
    this.recordAudit(portal, 'student.form.live-scan.upload.toggled', 'live-scan', {
      uploaded: portal.liveScanUploaded,
    });
    return this.repository.save(portal).liveScanUploaded;
  }

  updateCdphForm(studentId: string, payload: UpdateCdphFormDto) {
    const portal = this.repository.findByStudentId(studentId);
    portal.cdphForm = {
      ...portal.cdphForm,
      ...this.trimStringFields({ ...payload }),
    };
    portal.lastAction = 'CDPH application field updated.';
    this.recordAudit(portal, 'student.form.cdph.updated', 'cdph-283b', { ...payload });
    return this.repository.save(portal).cdphForm;
  }

  signCdphForm(studentId: string) {
    const portal = this.repository.findByStudentId(studentId);
    this.validateCdphForm(portal.cdphForm);
    portal.cdphSigned = true;
    portal.forms = portal.forms.map((form) =>
      form.id === 'cdph-283b'
        ? { ...form, status: 'Submitted', lastUpdated: new Date().toISOString(), actionLabel: 'View form' }
        : form,
    );
    portal.lastAction = 'CDPH 283B application signed and staged for review.';
    this.recordAudit(portal, 'student.form.cdph.signed', 'cdph-283b');
    return this.repository.save(portal).cdphSigned;
  }

  getSettings(studentId: string) {
    return this.repository.findByStudentId(studentId).settings;
  }

  updateSettings(studentId: string, payload: UpdateSettingDto) {
    const portal = this.repository.findByStudentId(studentId);
    portal.settings = {
      ...portal.settings,
      ...payload,
    };
    portal.lastAction = 'Student preferences saved.';
    this.recordAudit(portal, 'student.settings.updated', 'settings', { ...payload });
    return this.repository.save(portal).settings;
  }

  getAssignments(studentId: string) {
    return this.repository.findByStudentId(studentId).assignments;
  }

  markIntakeApproved(
    studentId: string,
    review?: { score: number | null; passed: boolean | null; totalQuestions: number },
  ) {
    const portal = this.repository.findByStudentId(studentId);
    if (review && review.score !== null && review.passed !== null) {
      portal.entranceExam.score = review.score;
      portal.entranceExam.totalQuestions = review.totalQuestions;
      portal.entranceExam.passed = review.passed;
      portal.entranceExam.rank = this.calculateEntranceExamRank(review.score, review.totalQuestions);
    }
    portal.workflowStage = 'enrollment_wizard';
    portal.onboarding.workflowStage = 'enrollment_wizard';
    portal.lastAction = 'Student intake approved. Enrollment workflow unlocked.';
    this.recordAudit(portal, 'student.intake.approved', 'entrance-exam', {
      approved: true,
      score: review?.score ?? undefined,
      passed: review?.passed ?? undefined,
    });
    return this.repository.save(portal).workflowStage;
  }

  markIntakeRejected(studentId: string, reason: string) {
    const portal = this.repository.findByStudentId(studentId);
    portal.workflowStage = 'admin_review';
    portal.onboarding.workflowStage = 'admin_review';
    portal.lastAction = 'Student intake was rejected and remains locked pending staff follow-up.';
    this.recordAudit(portal, 'student.intake.rejected', 'entrance-exam', {
      rejected: true,
      reason,
    });
    return this.repository.save(portal).workflowStage;
  }

  submitAssignment(studentId: string, assignmentId: string) {
    const portal = this.repository.findByStudentId(studentId);
    const assignment = portal.assignments.find((item) => item.id === assignmentId);

    if (!assignment) {
      throw new BadRequestException(`Assignment "${assignmentId}" was not found.`);
    }

    assignment.status = 'Submitted';
    portal.lastAction = 'Assignment submitted to the module workflow.';
    this.recordAudit(portal, 'student.assignment.submitted', assignmentId);
    return this.repository.save(portal).assignments.find((item) => item.id === assignmentId);
  }

  getSupport(studentId: string) {
    return this.repository.findByStudentId(studentId).supportTickets;
  }

  submitSupportTicket(studentId: string, payload: SubmitSupportTicketDto) {
    if (!payload.subject.trim() || !payload.message.trim()) {
      throw new BadRequestException('Support subject and message are required.');
    }

    const portal = this.repository.findByStudentId(studentId);
    const ticket = {
      id: `ticket-${Date.now()}`,
      subject: payload.subject.trim(),
      category: payload.category.trim() || 'Support',
      message: payload.message.trim(),
      status: 'Open' as const,
      createdAt: new Date().toISOString(),
    };

    portal.supportTickets = [ticket, ...portal.supportTickets];
    portal.lastAction = 'Support request created and added to the queue.';
    this.recordAudit(portal, 'student.support-ticket.submitted', ticket.id, {
      category: ticket.category,
    });
    return this.repository.save(portal).supportTickets[0];
  }

  getCertificates(studentId: string): StudentCertificatesSummary {
    const portal = this.repository.findByStudentId(studentId);
    return {
      moduleCertificatesReady: this.getModuleCertificatesReady(portal),
      totalModules: portal.modules.length,
      programCertificateReady: this.getProgramCertificateReady(portal),
      modules: portal.modules.map((module) => ({
        id: module.id,
        title: module.title,
        unlocked: module.certificateUnlocked,
        examScore: module.examScore,
      })),
    };
  }

  private getCurrentModule(portal: StudentPortalState) {
    const currentModule =
      portal.modules.find((module) => module.id === portal.activeModuleId) ??
      portal.modules.find((module) => module.status === 'In Progress') ??
      portal.modules[0];

    if (!currentModule) {
      throw new BadRequestException('Student portal does not contain a current module.');
    }

    return currentModule;
  }

  private getUnreadCount(portal: StudentPortalState) {
    return portal.threads.filter((thread) => thread.unread).length;
  }

  private getTheoryHoursCompleted(portal: StudentPortalState) {
    return portal.modules.reduce((total, module) => total + Math.min(module.completedHours, module.requiredHours), 0);
  }

  private getTheoryHoursRequired(portal: StudentPortalState) {
    return portal.modules.reduce((total, module) => total + module.requiredHours, 0);
  }

  private getClinicalHoursCompleted(portal: StudentPortalState) {
    return portal.clinicalLogs.reduce((total, log) => total + log.hours, 0);
  }

  private getPaymentBalance(portal: StudentPortalState) {
    return Math.max(portal.financials.balance, 0);
  }

  private getOverallProgressPercent(portal: StudentPortalState) {
    return Math.round(
      ((this.getTheoryHoursCompleted(portal) + this.getClinicalHoursCompleted(portal)) /
        (this.getTheoryHoursRequired(portal) + CLINICAL_HOURS_REQUIRED)) *
        100,
    );
  }

  private getModuleCertificatesReady(portal: StudentPortalState) {
    return portal.modules.filter((module) => module.certificateUnlocked).length;
  }

  private getProgramCertificateReady(portal: StudentPortalState) {
    return (
      portal.modules.every((module) => module.status === 'Complete') &&
      this.getPaymentBalance(portal) === 0 &&
      portal.exitSurveyComplete
    );
  }

  private recalculateModule(module: CurriculumModule) {
    const completedSteps = module.steps.filter((step) => step.complete).length;
    const progressPercent = Math.round((completedSteps / module.steps.length) * 100);
    const completedHours = Math.min(
      module.requiredHours,
      Math.max(0, Math.round((progressPercent / 100) * module.requiredHours)),
    );

    return {
      ...module,
      progressPercent,
      completedHours,
      status:
        progressPercent >= 100
          ? 'Complete'
          : progressPercent > 0 && module.status !== 'Locked'
            ? 'In Progress'
            : module.status,
    } satisfies CurriculumModule;
  }

  private validateCdphForm(form: CdphForm) {
    const requiredFields = [form.firstName, form.lastName, form.dob, form.phone, form.email, form.city, form.zip];
    if (requiredFields.some((value) => value.trim().length === 0)) {
      throw new BadRequestException('CDPH form is incomplete. All required fields must be filled.');
    }

    if (!form.email.includes('@')) {
      throw new BadRequestException('CDPH form requires a valid email address.');
    }

    if (form.conviction && form.convictionDetails.trim().length === 0) {
      throw new BadRequestException('Conviction details are required when conviction is marked yes.');
    }
  }

  private trimStringFields<TValue extends Record<string, unknown>>(value: TValue): TValue {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, typeof entry === 'string' ? entry.trim() : entry]),
    ) as TValue;
  }

  private formatIsoDay(offset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
  }

  private recordAudit(
    portal: StudentPortalState,
    action: string,
    target: string,
    details?: Record<string, string | number | boolean | null | undefined>,
  ) {
    const filteredDetails = Object.fromEntries(
      Object.entries(details ?? {}).filter(([, value]) => value !== undefined && value !== null),
    ) as Record<string, string | number | boolean>;

    const auditEvent: StudentAuditEvent = {
      id: `audit-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      actor: portal.profile.id,
      action,
      target,
      occurredAt: new Date().toISOString(),
      details: Object.keys(filteredDetails).length > 0 ? filteredDetails : undefined,
    };

    portal.auditTrail = [auditEvent, ...portal.auditTrail];
  }

  private slugify(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  private syncWorkflowState(portal: StudentPortalState) {
    const approvalStatus = this.intakeSubmissionService.getStudentApprovalStatus(portal.profile.id);
    let nextStage = portal.workflowStage;

    if (approvalStatus === 'approved') {
      if (portal.entranceSurvey.completed) {
        nextStage = 'active';
      } else if (portal.enrollmentWizard.submitted) {
        nextStage = 'orientation_survey';
      } else {
        nextStage = 'enrollment_wizard';
      }
    }

    if (nextStage !== portal.workflowStage || nextStage !== portal.onboarding.workflowStage) {
      portal.workflowStage = nextStage;
      portal.onboarding.workflowStage = nextStage;
      portal.lastAction = `Workflow stage synchronized to ${nextStage.replaceAll('_', ' ')}.`;
      return this.repository.save(portal);
    }

    return portal;
  }

  private assertStudentApproved(studentId: string) {
    const approvalStatus = this.intakeSubmissionService.getStudentApprovalStatus(studentId);

    if (approvalStatus !== 'approved') {
      throw new BadRequestException('This step is locked until admin approves the student intake.');
    }
  }

  private assertEntranceExamEditable(studentId: string) {
    const approvalStatus = this.intakeSubmissionService.getStudentApprovalStatus(studentId);

    if (approvalStatus === 'pending' || approvalStatus === 'approved') {
      throw new BadRequestException('Entrance exam answers are locked after submission.');
    }
  }

  private calculateEntranceExamRank(score: number, totalQuestions: number) {
    if (totalQuestions === 0) {
      return null;
    }

    const percent = Math.round((score / totalQuestions) * 100);

    if (percent >= 90) {
      return 'A';
    }

    if (percent >= 80) {
      return 'B';
    }

    if (percent >= 70) {
      return 'C';
    }

    if (percent >= 60) {
      return 'D';
    }

    return 'F';
  }
}
