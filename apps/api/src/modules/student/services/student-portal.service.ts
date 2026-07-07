import { BadRequestException, Injectable } from '@nestjs/common';

import type { LocalUserRecord } from '../../auth/types/auth-user.types';
import type {
  AdvanceLearningDto,
  ActiveLearningAttention,
  ActiveExamSession,
  AiTutorConversation,
  AiTutorMessage,
  AnswerOnboardingQuestionDto,
  AskAiTutorDto,
  AttendanceCheckInDto,
  AttendanceRecord,
  CdphForm,
  ClinicalLogEntry,
  CreateEnrollmentPaymentIntentDto,
  CurriculumModule,
  DocumentChecklistItem,
  LogClinicalHoursDto,
  OnboardingState,
  RecordPaymentDto,
  RegisterCohortDto,
  ReportLearningAttentionEventDto,
  ReportExamSecurityEventDto,
  ReplaceStudentDocumentDto,
  ReportAbsenceDto,
  SelectModuleDto,
  SetLearningSessionDto,
  StartModuleExamSessionDto,
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
  StudentViolationLogEntry,
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
import { DocumentRequirementsConfigService } from './document-requirements-config.service';
import { ExamConfigService } from './exam-config.service';
import { GeminiService } from './gemini.service';
import { IntakeSubmissionService } from './intake-submission.service';
import { LearningResourcesConfigService } from './learning-resources-config.service';
import { StripePaymentsService } from './stripe-payments.service';
import { StudentPortalRepository } from './student-portal.repository';

const CLINICAL_HOURS_REQUIRED = 40;

const EXAM_SECURITY_EVENT_ACTION = 'student.learning.exam-session.security-event';
const LEARNING_ATTENTION_EVENT_ACTION = 'student.learning.attention-event.recorded';

const EXAM_VIOLATION_LABELS: Record<string, string> = {
  visibility_hidden: 'Exam tab switched / hidden',
  window_blur: 'Exam window focus lost',
  fullscreen_exit: 'Exited fullscreen during exam',
  navigation_blocked: 'Blocked navigation attempt',
  shortcut_blocked: 'Blocked keyboard shortcut',
  context_menu: 'Right-click / context menu opened',
  copy_attempt: 'Copy attempt blocked',
  paste_attempt: 'Paste attempt blocked',
  back_button_blocked: 'Back button blocked',
};

const EXAM_VIOLATION_TONES: Record<string, 'warning' | 'error' | 'info'> = {
  visibility_hidden: 'warning',
  window_blur: 'warning',
  fullscreen_exit: 'error',
  navigation_blocked: 'warning',
  shortcut_blocked: 'warning',
  context_menu: 'warning',
  copy_attempt: 'error',
  paste_attempt: 'error',
  back_button_blocked: 'warning',
};

const LEARNING_VIOLATION_LABELS: Record<string, string> = {
  visibility_hidden: 'Lesson tab switched / hidden',
  window_blur: 'Lesson window focus lost',
  session_paused: 'Learning session manually paused',
};

const LEARNING_VIOLATION_TONES: Record<string, 'warning' | 'error' | 'info'> = {
  visibility_hidden: 'warning',
  window_blur: 'warning',
  session_paused: 'info',
};

@Injectable()
export class StudentPortalService {
  constructor(
    private readonly repository: StudentPortalRepository,
    private readonly examConfigService: ExamConfigService,
    private readonly intakeSubmissionService: IntakeSubmissionService,
    private readonly learningResourcesConfigService: LearningResourcesConfigService,
    private readonly cohortsConfigService: CohortsConfigService,
    private readonly documentRequirementsConfigService: DocumentRequirementsConfigService,
    private readonly geminiService: GeminiService,
    private readonly stripePaymentsService: StripePaymentsService,
  ) {}

  ensurePortalForLocalUser(localUser: LocalUserRecord) {
    return this.repository.ensureForLocalUser(localUser);
  }

  getPortal(studentId: string) {
    const portal = this.syncWorkflowState(this.repository.findByStudentId(studentId));
    return {
      ...portal,
      onboarding: {
        ...portal.onboarding,
        documentChecklist: this.buildDocumentChecklist(portal.onboarding),
      },
    };
  }

  getProfile(studentId: string) {
    return this.repository.findByStudentId(studentId).profile;
  }

  updateProfile(studentId: string, payload: UpdateStudentProfileDto) {
    let portal = this.repository.findByStudentId(studentId);

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

  getEnrollmentFeeSummary(): { amount: number; moduleCount: number } {
    const modules = this.learningResourcesConfigService.getConfig().modules;
    const amount = modules.reduce((sum, module) => sum + Math.max(0, module.moduleFee ?? 0), 0);

    return { amount, moduleCount: modules.length };
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
          feeAmount: this.stripePaymentsService.getEnrollmentPricing(cohort.id).amount,
          moduleCount: cohort.moduleIds.length,
          moduleTitles: cohort.moduleIds
            .map((moduleId) => moduleTitleById.get(moduleId))
            .filter((title): title is string => Boolean(title)),
        })),
    };
  }

  createEnrollmentPaymentIntent(studentId: string, payload: CreateEnrollmentPaymentIntentDto) {
    this.assertStudentApproved(studentId);
    const cohortId = payload.cohortId?.trim();

    if (!cohortId) {
      throw new BadRequestException('A cohortId is required to start enrollment payment.');
    }

    return this.stripePaymentsService.createEnrollmentPaymentIntent(studentId, cohortId);
  }

  async registerCohort(studentId: string, payload: RegisterCohortDto): Promise<StudentCohortsSnapshot> {
    this.assertStudentApproved(studentId);
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

    const pricing = this.stripePaymentsService.getEnrollmentPricing(cohort.id);
    let portal = this.repository.findByStudentId(studentId);

    if (portal.profile.cohortId === cohort.id) {
      return this.getCohorts(studentId);
    }

    let paymentVerified: {
      amount: number;
      paymentIntentId: string;
      methodLabel: string;
    } | null = null;

    if (pricing.amount > 0) {
      paymentVerified = await this.stripePaymentsService.verifyEnrollmentPayment(
        studentId,
        cohort.id,
        payload.paymentIntentId ?? '',
      );

      const alreadyRecorded = portal.financials.paymentPlan.some(
        (payment) => payment.stripePaymentIntentId === paymentVerified?.paymentIntentId,
      );

      if (!alreadyRecorded) {
        this.recordPayment(studentId, {
          amount: paymentVerified.amount,
          method: paymentVerified.methodLabel,
          stripePaymentIntentId: paymentVerified.paymentIntentId,
        });
        portal = this.repository.findByStudentId(studentId);
      }
    }

    portal.profile = {
      ...portal.profile,
      cohortId: cohort.id,
      cohort: cohort.name,
    };

    if (pricing.amount > 0) {
      portal.financials = {
        ...portal.financials,
        totalTuition: pricing.amount,
        balance: Math.max(0, pricing.amount - portal.financials.amountPaid),
      };
    }

    this.recordAudit(portal, 'student.cohort.registered', cohort.id, {
      cohortName: cohort.name,
      feeAmount: pricing.amount,
      paymentIntentId: paymentVerified?.paymentIntentId,
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

    const missingDocument = this.documentRequirementsConfigService
      .getDocumentsFor('student')
      .find((document) => document.required && !portal.onboarding.readinessUploads[document.id]);

    if (missingDocument) {
      throw new BadRequestException(`Document "${missingDocument.name}" must be uploaded before submission.`);
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
      documents: this.documentRequirementsConfigService.getDocumentsFor('student').map((document) => {
        const file = portal.onboarding.readinessDocumentFiles[document.id];
        return {
          documentId: document.id,
          name: document.name,
          description: document.description,
          required: document.required,
          fileName: file?.fileName,
          fileUrl: file?.url,
          reviewStatus: 'pending',
        };
      }),
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
    const portal = this.repository.findByStudentId(studentId);
    return {
      ...portal.onboarding,
      documentChecklist: this.buildDocumentChecklist(portal.onboarding),
    };
  }

  uploadReadinessDocument(
    studentId: string,
    documentId: string,
    file: { fileName: string; url: string },
  ) {
    this.assertEntranceExamEditable(studentId);

    const document = this.documentRequirementsConfigService.getDocumentsFor('student').find(
      (item) => item.id === documentId,
    );

    if (!document) {
      throw new BadRequestException(`Document "${documentId}" was not found.`);
    }

    const portal = this.repository.findByStudentId(studentId);
    portal.onboarding.readinessUploads = {
      ...portal.onboarding.readinessUploads,
      [documentId]: true,
    };
    portal.onboarding.readinessDocumentFiles = {
      ...portal.onboarding.readinessDocumentFiles,
      [documentId]: {
        fileName: file.fileName,
        url: file.url,
        uploadedAt: new Date().toISOString(),
      },
    };
    portal.lastAction = `Uploaded "${document.name}" for admissions review.`;
    this.recordAudit(portal, 'student.onboarding.document.uploaded', documentId, {
      documentId,
      fileName: file.fileName,
    });

    const saved = this.repository.save(portal);
    return {
      ...saved.onboarding,
      documentChecklist: this.buildDocumentChecklist(saved.onboarding),
    };
  }

  private buildDocumentChecklist(
    onboarding: Pick<OnboardingState, 'readinessUploads' | 'readinessDocumentFiles'>,
  ): DocumentChecklistItem[] {
    return this.documentRequirementsConfigService.getDocumentsFor('student').map((document) => {
      const file = onboarding.readinessDocumentFiles[document.id];
      return {
        id: document.id,
        name: document.name,
        description: document.description,
        required: document.required,
        uploaded: Boolean(onboarding.readinessUploads[document.id]),
        fileName: file?.fileName,
        fileUrl: file?.url,
      };
    });
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
    const requiredDocuments = this.documentRequirementsConfigService
      .getDocumentsFor('student')
      .filter((document) => document.required);
    const readinessComplete = requiredDocuments.every(
      (document) => portal.onboarding.readinessUploads[document.id] === true,
    );

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
    const currentModule = this.getCurrentModule(portal);
    const requiredSessionMinutes = this.getRequiredSessionMinutes(currentModule);
    const sessionMinutes = Math.min(this.getModuleSessionMinutes(currentModule), requiredSessionMinutes);

    return {
      activeModuleId: portal.activeModuleId,
      currentModule,
      modules: portal.modules,
      learningMinutes: portal.learningMinutes,
      sessionMinutes,
      requiredSessionMinutes,
      learningSessionActive: portal.learningSessionActive,
      activeLessonId: portal.activeLessonId,
      lessonElapsedMinutes: this.getLessonElapsedMinutes(portal),
      activeLearningAttention: portal.activeLearningAttention,
      activeExamSession: portal.activeExamSession,
      examUnlocked: sessionMinutes >= requiredSessionMinutes,
      textbookIssued: portal.textbookIssued,
      textbookOpened: portal.textbookOpened,
      exitSurveyComplete: portal.exitSurveyComplete,
      moduleCertificatesReady: this.getModuleCertificatesReady(portal),
      programCertificateReady: this.getProgramCertificateReady(portal),
    };
  }

  advanceLearning(studentId: string, payload: AdvanceLearningDto) {
    const portal = this.repository.findByStudentId(studentId);
    const minutes = payload.minutes ?? 1;

    if (!Number.isFinite(minutes) || minutes <= 0) {
      throw new BadRequestException('Learning minutes must be greater than zero.');
    }

    if (minutes > 60) {
      throw new BadRequestException('Learning time is recorded automatically in small increments.');
    }

    if (!portal.learningSessionActive) {
      throw new BadRequestException('Start a learning session before recording time.');
    }

    const activeIndex = portal.modules.findIndex((module) => module.id === portal.activeModuleId);
    const activeModule = portal.modules[activeIndex];

    if (!activeModule) {
      throw new BadRequestException('Active learning module was not found.');
    }

    if (activeModule.status === 'Locked') {
      throw new BadRequestException('Locked modules cannot record learning time.');
    }

    const requiredSessionMinutes = this.getRequiredSessionMinutes(activeModule);
    const currentSessionMinutes = this.getModuleSessionMinutes(activeModule);
    const nextSessionMinutes = Math.min(currentSessionMinutes + minutes, requiredSessionMinutes);
    const creditedMinutes = Math.max(0, nextSessionMinutes - currentSessionMinutes);

    portal.learningMinutes += creditedMinutes;
    const lessonElapsedMinutes = this.getLessonElapsedMinutes(portal);

    if (creditedMinutes > 0 && portal.activeLessonId) {
      const activeLessonExists = activeModule.steps.some((step) => step.id === portal.activeLessonId);

      if (activeLessonExists) {
        lessonElapsedMinutes[portal.activeLessonId] =
          Math.max(0, lessonElapsedMinutes[portal.activeLessonId] ?? 0) + creditedMinutes;
        portal.lessonElapsedMinutes = lessonElapsedMinutes;
      }
    }

    portal.activeExamSession = undefined;
    portal.modules[activeIndex] = this.recalculateModule({
      ...activeModule,
      sessionMinutes: nextSessionMinutes,
      steps: [...activeModule.steps],
    });

    if (this.getTheoryHoursCompleted(portal) >= this.getTheoryHoursRequired(portal)) {
      portal.tasks = portal.tasks.map((task) =>
        task.id === 'theory-hours' ? { ...task, complete: true } : task,
      );
    }

    portal.lastAction =
      nextSessionMinutes >= requiredSessionMinutes
        ? `${activeModule.title} session time completed — module assessment unlocked.`
        : 'Learning session time recorded.';

    this.recordAudit(portal, 'student.learning.advanced', portal.activeModuleId, {
      minutes: creditedMinutes,
    });
    return this.repository.save(portal).modules;
  }

  setLearningSession(studentId: string, payload: SetLearningSessionDto) {
    const portal = this.repository.findByStudentId(studentId);

    if (portal.learningSessionActive === payload.active) {
      return portal.learningSessionActive;
    }

    if (!payload.active && portal.activeExamSession) {
      throw new BadRequestException('Secure exam sessions cannot be paused.');
    }

    portal.learningSessionActive = payload.active;
    portal.lastAction = payload.active ? 'Learning session started.' : 'Learning session paused.';
    this.recordAudit(portal, 'student.learning.session.toggled', portal.activeModuleId, {
      active: portal.learningSessionActive,
    });
    return this.repository.save(portal).learningSessionActive;
  }

  reportLearningAttentionEvent(studentId: string, payload: ReportLearningAttentionEventDto) {
    const portal = this.repository.findByStudentId(studentId);
    const activeModule = portal.modules.find((module) => module.id === portal.activeModuleId);
    const lessonId = portal.activeLessonId;

    if (!activeModule || !lessonId) {
      throw new BadRequestException('Start a lesson session before recording learning attention events.');
    }

    if (!payload.type) {
      throw new BadRequestException('Learning attention event type is required.');
    }

    const lesson = activeModule.steps.find((step) => step.id === lessonId);

    if (!lesson) {
      throw new BadRequestException('Active lesson was not found for learning attention tracking.');
    }

    const session = this.ensureLearningAttentionSession(portal, activeModule.id, lessonId);
    const now = new Date().toISOString();
    session.lastActivityAt = now;
    session.warnings += 1;

    switch (payload.type) {
      case 'visibility_hidden':
        session.visibilityLossCount += 1;
        portal.learningSessionActive = false;
        break;
      case 'window_blur':
        session.focusLossCount += 1;
        portal.learningSessionActive = false;
        break;
      case 'session_paused':
        session.manualPauseCount += 1;
        portal.learningSessionActive = false;
        break;
      default:
        break;
    }

    session.recentEvents = [
      {
        id: `learning-event-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        type: payload.type,
        occurredAt: now,
        detail: payload.detail?.trim() || undefined,
      },
      ...session.recentEvents,
    ].slice(0, 12);

    portal.activeLearningAttention = session;
    portal.lastAction = `Learning attention event recorded: ${payload.type.replaceAll('_', ' ')}.`;
    this.recordAudit(portal, 'student.learning.attention-event.recorded', lessonId, {
      moduleId: activeModule.id,
      type: payload.type,
      warnings: session.warnings,
    });
    return this.repository.save(portal).activeLearningAttention;
  }

  toggleLearningSession(studentId: string) {
    const portal = this.repository.findByStudentId(studentId);
    return this.setLearningSession(studentId, { active: !portal.learningSessionActive });
  }

  startModuleExamSession(studentId: string, moduleId: string, payload: StartModuleExamSessionDto) {
    const portal = this.repository.findByStudentId(studentId);
    const activeModule = portal.modules.find((module) => module.id === moduleId);

    if (!activeModule) {
      throw new BadRequestException(`Module "${moduleId}" was not found.`);
    }

    const examStep = this.assertExamSessionReady(activeModule, payload.stepId);

    if (
      portal.activeExamSession &&
      (portal.activeExamSession.moduleId !== moduleId || portal.activeExamSession.stepId !== examStep.id)
    ) {
      throw new BadRequestException('Finish the current secure exam session before starting another one.');
    }

    if (
      portal.activeExamSession &&
      portal.activeExamSession.moduleId === moduleId &&
      portal.activeExamSession.stepId === examStep.id
    ) {
      return portal.activeExamSession;
    }

    const now = new Date().toISOString();
    portal.activeExamSession = {
      moduleId,
      stepId: examStep.id,
      startedAt: now,
      lastActivityAt: now,
      focusLossCount: 0,
      visibilityLossCount: 0,
      fullscreenExitCount: 0,
      shortcutBlockCount: 0,
      copyPasteCount: 0,
      navigationAttemptCount: 0,
      warnings: 0,
      recentEvents: [],
    };
    portal.activeModuleId = moduleId;
    portal.activeLessonId = undefined;
    portal.lastAction = `Secure exam session started for ${activeModule.title}.`;
    this.recordAudit(portal, 'student.learning.exam-session.started', examStep.id, {
      moduleId,
    });
    return this.repository.save(portal).activeExamSession;
  }

  reportExamSecurityEvent(studentId: string, moduleId: string, payload: ReportExamSecurityEventDto) {
    const portal = this.repository.findByStudentId(studentId);
    const session = portal.activeExamSession;

    if (!session || session.moduleId !== moduleId) {
      throw new BadRequestException('No active secure exam session is available for this module.');
    }

    if (!payload.type) {
      throw new BadRequestException('Exam security event type is required.');
    }

    const now = new Date().toISOString();
    session.lastActivityAt = now;
    session.warnings += 1;

    switch (payload.type) {
      case 'visibility_hidden':
        session.visibilityLossCount += 1;
        break;
      case 'window_blur':
        session.focusLossCount += 1;
        break;
      case 'fullscreen_exit':
        session.fullscreenExitCount += 1;
        break;
      case 'copy_attempt':
      case 'paste_attempt':
        session.copyPasteCount += 1;
        break;
      case 'shortcut_blocked':
        session.shortcutBlockCount += 1;
        break;
      case 'navigation_blocked':
      case 'back_button_blocked':
      case 'context_menu':
        session.navigationAttemptCount += 1;
        break;
      default:
        break;
    }

    session.recentEvents = [
      {
        id: `exam-event-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        type: payload.type,
        occurredAt: now,
        detail: payload.detail?.trim() || undefined,
      },
      ...session.recentEvents,
    ].slice(0, 12);

    portal.activeExamSession = session;
    portal.lastAction = `Secure exam event recorded: ${payload.type.replaceAll('_', ' ')}.`;
    this.recordAudit(portal, 'student.learning.exam-session.security-event', session.stepId, {
      moduleId,
      type: payload.type,
      warnings: session.warnings,
    });
    return this.repository.save(portal).activeExamSession;
  }

  getAiTutorConversation(studentId: string, moduleId: string, lessonId: string): AiTutorConversation {
    const portal = this.repository.findByStudentId(studentId);
    return (
      portal.aiTutorConversations.find(
        (conversation) => conversation.moduleId === moduleId && conversation.lessonId === lessonId,
      ) ?? {
        moduleId,
        lessonId,
        updatedAt: new Date().toISOString(),
        messages: [],
      }
    );
  }

  async askAiTutor(
    studentId: string,
    moduleId: string,
    lessonId: string,
    payload: AskAiTutorDto,
  ): Promise<AiTutorConversation> {
    const portal = this.repository.findByStudentId(studentId);
    this.assertNoActiveExamSession(portal, 'AI tutor chat is locked during secure exam mode.');

    const activeModule = portal.modules.find((module) => module.id === moduleId);
    if (!activeModule) {
      throw new BadRequestException(`Module "${moduleId}" was not found.`);
    }

    const lesson = activeModule.steps.find((step) => step.id === lessonId);
    if (!lesson) {
      throw new BadRequestException(`Lesson "${lessonId}" was not found in module "${moduleId}".`);
    }

    const question = payload.question?.trim();
    if (!question) {
      throw new BadRequestException('A question is required to ask the AI tutor.');
    }

    let conversation = portal.aiTutorConversations.find(
      (item) => item.moduleId === moduleId && item.lessonId === lessonId,
    );

    if (!conversation) {
      conversation = { moduleId, lessonId, updatedAt: new Date().toISOString(), messages: [] };
      portal.aiTutorConversations = [...portal.aiTutorConversations, conversation];
    }

    const lessonContext = [activeModule.title, activeModule.summary, lesson.title, lesson.note, lesson.content]
      .filter(Boolean)
      .join('\n\n');

    const history = conversation.messages.map((message) => ({
      role: message.role === 'student' ? ('user' as const) : ('model' as const),
      text: message.text,
    }));

    const studentMessage: AiTutorMessage = {
      id: `ai-msg-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      role: 'student',
      text: question,
      sentAt: new Date().toISOString(),
    };

    let replyText: string;
    try {
      replyText = await this.geminiService.getTutorReply(history, question, lessonContext);
    } catch {
      replyText = "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
    }

    const tutorMessage: AiTutorMessage = {
      id: `ai-msg-${Date.now()}-${Math.round(Math.random() * 1000) + 1}`,
      role: 'tutor',
      text: replyText,
      sentAt: new Date().toISOString(),
    };

    conversation.messages = [...conversation.messages, studentMessage, tutorMessage];
    conversation.updatedAt = tutorMessage.sentAt;

    portal.lastAction = `Asked the AI tutor about ${lesson.title}.`;
    this.recordAudit(portal, 'student.learning.ai-tutor.message', lessonId, { moduleId });

    this.repository.save(portal);
    return conversation;
  }

  recordLessonSessionStart(studentId: string, lessonId: string) {
    const portal = this.repository.findByStudentId(studentId);
    this.assertNoActiveExamSession(portal, 'Learning lessons are locked during secure exam mode.');
    const activeModule = portal.modules.find((module) => module.id === portal.activeModuleId);

    if (!activeModule) {
      throw new BadRequestException('Active learning module was not found.');
    }

    const lesson = activeModule.steps.find((step) => step.id === lessonId);

    if (!lesson) {
      throw new BadRequestException(`Lesson "${lessonId}" was not found in the active module.`);
    }

    const lessonElapsedMinutes = this.getLessonElapsedMinutes(portal);
    portal.activeLessonId = lessonId;
    portal.lessonElapsedMinutes = {
      ...lessonElapsedMinutes,
      [lessonId]: Math.max(0, lessonElapsedMinutes[lessonId] ?? 0),
    };
    portal.activeLearningAttention = this.ensureLearningAttentionSession(portal, activeModule.id, lessonId);
    portal.lastAction = `Lesson timer resumed for ${lesson.title}.`;
    this.recordAudit(portal, 'student.learning.lesson-session.started', lessonId, {
      moduleId: activeModule.id,
      elapsedMinutes: portal.lessonElapsedMinutes[lessonId],
    });
    const savedPortal = this.repository.save(portal);
    return {
      activeLessonId: savedPortal.activeLessonId,
      lessonElapsedMinutes: savedPortal.lessonElapsedMinutes,
    };
  }

  selectModule(studentId: string, payload: SelectModuleDto) {
    const portal = this.repository.findByStudentId(studentId);
    this.assertNoActiveExamSession(portal, 'Module switching is blocked during secure exam mode.');
    const module = portal.modules.find((item) => item.id === payload.moduleId);

    if (!module) {
      throw new BadRequestException(`Module "${payload.moduleId}" was not found.`);
    }

    portal.activeModuleId = payload.moduleId;
    if (!module.steps.some((step) => step.id === portal.activeLessonId)) {
      portal.activeLessonId = undefined;
      portal.activeLearningAttention = undefined;
    }
    portal.lastAction = 'Learning viewer switched to a different module.';
    return this.repository.save(portal).activeModuleId;
  }

  toggleModuleStep(studentId: string, moduleId: string, stepId: string) {
    const portal = this.repository.findByStudentId(studentId);
    this.assertNoActiveExamSession(portal, 'Learning activities are locked during secure exam mode.');
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

    const requiredSessionMinutes = this.getRequiredSessionMinutes(activeModule);
    const sessionMinutes = this.getModuleSessionMinutes(activeModule);

    if (sessionMinutes < requiredSessionMinutes) {
      throw new BadRequestException(
        `Complete the required ${activeModule.requiredHours}h session time for this module before submitting — ${this.formatMinutes(requiredSessionMinutes - sessionMinutes)} remaining.`,
      );
    }

    const allLearningStepsComplete = activeModule.steps
      .filter((step) => step.type !== 'Quiz')
      .every((step) => step.complete);

    if (!allLearningStepsComplete) {
      throw new BadRequestException('Complete all module learning steps before submitting the exam.');
    }

    const examStep =
      activeModule.steps.find((step) => step.id === payload?.stepId && step.type === 'Quiz') ??
      activeModule.steps.find((step) => step.type === 'Quiz');

    if (examStep) {
      if (
        !portal.activeExamSession ||
        portal.activeExamSession.moduleId !== moduleId ||
        portal.activeExamSession.stepId !== examStep.id
      ) {
        throw new BadRequestException('Start the secure exam session before submitting this assessment.');
      }
    }

    const result = this.gradeModuleExam(moduleId, payload);

    if (!result.passed) {
      portal.activeExamSession = undefined;
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
    portal.activeExamSession = undefined;

    const nextModule = portal.modules[activeIndex + 1];
    if (nextModule && nextModule.status === 'Locked') {
      portal.modules[activeIndex + 1] = {
        ...nextModule,
        status: 'In Progress',
      };
      portal.activeModuleId = nextModule.id;
      portal.activeLessonId = undefined;
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
    this.assertNoActiveExamSession(portal, 'Messaging is unavailable during secure exam mode.');
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
        stripePaymentIntentId: payload.stripePaymentIntentId?.trim() || undefined,
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
      stripePaymentIntentId: payload.stripePaymentIntentId,
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

  getSecurityViolationsLog(): StudentViolationLogEntry[] {
    const entries: StudentViolationLogEntry[] = [];

    for (const portal of this.repository.findAll()) {
      for (const audit of portal.auditTrail) {
        const isExamEvent = audit.action === EXAM_SECURITY_EVENT_ACTION;
        const isLearningEvent = audit.action === LEARNING_ATTENTION_EVENT_ACTION;

        if (!isExamEvent && !isLearningEvent) {
          continue;
        }

        const type = String(audit.details?.type ?? 'unknown');
        const moduleId = audit.details?.moduleId ? String(audit.details.moduleId) : undefined;
        const moduleTitle = moduleId
          ? portal.modules.find((module) => module.id === moduleId)?.title
          : undefined;
        const labels = isExamEvent ? EXAM_VIOLATION_LABELS : LEARNING_VIOLATION_LABELS;
        const tones = isExamEvent ? EXAM_VIOLATION_TONES : LEARNING_VIOLATION_TONES;
        const warnings = audit.details?.warnings;

        entries.push({
          id: audit.id,
          studentId: portal.profile.id,
          studentName: portal.profile.fullName,
          studentNumber: portal.profile.studentNumber,
          context: isExamEvent ? 'secure_exam' : 'learning_session',
          contextLabel: isExamEvent ? 'Secure Exam' : 'Learning Session',
          type,
          label: labels[type] ?? type.replaceAll('_', ' '),
          tone: tones[type] ?? 'warning',
          moduleId,
          moduleTitle,
          stepId: audit.target,
          warningsAtEvent: typeof warnings === 'number' ? warnings : undefined,
          occurredAt: audit.occurredAt,
        });
      }
    }

    return entries.sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
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

  private getLessonElapsedMinutes(portal: StudentPortalState) {
    return { ...(portal.lessonElapsedMinutes ?? {}) };
  }

  private ensureLearningAttentionSession(
    portal: StudentPortalState,
    moduleId: string,
    lessonId: string,
  ): ActiveLearningAttention {
    if (
      portal.activeLearningAttention &&
      portal.activeLearningAttention.moduleId === moduleId &&
      portal.activeLearningAttention.lessonId === lessonId
    ) {
      return portal.activeLearningAttention;
    }

    const now = new Date().toISOString();
    return {
      moduleId,
      lessonId,
      startedAt: now,
      lastActivityAt: now,
      focusLossCount: 0,
      visibilityLossCount: 0,
      manualPauseCount: 0,
      warnings: 0,
      recentEvents: [],
    };
  }

  private assertNoActiveExamSession(portal: StudentPortalState, message: string) {
    if (portal.activeExamSession) {
      throw new BadRequestException(message);
    }
  }

  private assertExamSessionReady(module: CurriculumModule, stepId: string) {
    if (module.status === 'Locked') {
      throw new BadRequestException('Locked modules cannot start secure exams.');
    }

    const requiredSessionMinutes = this.getRequiredSessionMinutes(module);
    const sessionMinutes = this.getModuleSessionMinutes(module);

    if (sessionMinutes < requiredSessionMinutes) {
      throw new BadRequestException(
        `Complete the required ${module.requiredHours}h session time for this module before starting the secure exam.`,
      );
    }

    const examStep = module.steps.find((step) => step.id === stepId && step.type === 'Quiz');

    if (!examStep) {
      throw new BadRequestException(`Quiz step "${stepId}" was not found in this module.`);
    }

    const allLearningStepsComplete = module.steps
      .filter((step) => step.type !== 'Quiz')
      .every((step) => step.complete);

    if (!allLearningStepsComplete) {
      throw new BadRequestException('Complete all module learning steps before starting the secure exam.');
    }

    return examStep;
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
    const progressPercent =
      module.steps.length > 0 ? Math.round((completedSteps / module.steps.length) * 100) : 0;
    const requiredSessionMinutes = this.getRequiredSessionMinutes(module);
    const sessionMinutes = Math.min(this.getModuleSessionMinutes(module), requiredSessionMinutes);
    const sessionComplete = sessionMinutes >= requiredSessionMinutes;
    // Hours completed reflect real recorded session time, not manual step toggles.
    const completedHours = Math.min(
      module.requiredHours,
      Math.round((sessionMinutes / 60) * 10) / 10,
    );

    return {
      ...module,
      progressPercent,
      completedHours,
      sessionMinutes,
      status:
        module.status === 'Complete' || (progressPercent >= 100 && sessionComplete)
          ? 'Complete'
          : (progressPercent > 0 || sessionMinutes > 0) && module.status !== 'Locked'
            ? 'In Progress'
            : module.status,
    } satisfies CurriculumModule;
  }

  private getRequiredSessionMinutes(module: CurriculumModule) {
    return Math.max(0, Math.round(module.requiredHours * 60));
  }

  private getModuleSessionMinutes(module: CurriculumModule) {
    // Portals persisted before per-module session tracking fall back to their
    // recorded completed hours so students keep the time they already earned.
    return Math.max(0, Math.round(module.sessionMinutes ?? module.completedHours * 60));
  }

  private formatMinutes(totalMinutes: number) {
    const minutes = Math.max(0, Math.round(totalMinutes));
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
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
