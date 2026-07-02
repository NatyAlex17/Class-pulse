import { existsSync, rmSync } from 'fs';
import { join } from 'path';

import { BadRequestException } from '@nestjs/common';

import { ExamConfigService } from './exam-config.service';
import { IntakeSubmissionService } from './intake-submission.service';
import { LearningResourcesConfigService } from './learning-resources-config.service';
import { StudentPortalRepository } from './student-portal.repository';
import { StudentPortalService } from './student-portal.service';

describe('StudentPortalService', () => {
  let service: StudentPortalService;
  let intakeSubmissionService: IntakeSubmissionService;

  beforeEach(() => {
    const intakeSubmissionPath = join(process.cwd(), '.data', 'intake-submissions.json');
    const studentPortalPath = join(process.cwd(), '.data', 'student-portals.json');
    if (existsSync(intakeSubmissionPath)) {
      rmSync(intakeSubmissionPath);
    }
    if (existsSync(studentPortalPath)) {
      rmSync(studentPortalPath);
    }

    const examConfigService = new ExamConfigService();
    const learningResourcesConfigService = new LearningResourcesConfigService();
    intakeSubmissionService = new IntakeSubmissionService();
    service = new StudentPortalService(
      new StudentPortalRepository(examConfigService, learningResourcesConfigService),
      examConfigService,
      intakeSubmissionService,
    );
  });

  it('returns a structured dashboard snapshot', () => {
    const dashboard = service.getDashboard('student-amara-singh');

    expect(dashboard.profile.fullName).toBe('Amara Singh');
    expect(dashboard.metrics).toHaveLength(4);
    expect(dashboard.currentModule.id).toBe('m3');
  });

  it('blocks onboarding submission until required inputs are complete', () => {
    expect(() => service.submitOnboarding('student-amara-singh')).toThrow(BadRequestException);
  });

  it('records a valid payment against the student balance', () => {
    const financials = service.recordPayment('student-amara-singh', {
      amount: 100,
      method: 'Visa ....4242',
    });

    expect(financials.amountPaid).toBe(1850);
    expect(financials.balance).toBe(1650);
    expect(financials.paymentPlan[0]?.amount).toBe(100);
  });

  it('rejects overpayments', () => {
    expect(() =>
      service.recordPayment('student-amara-singh', {
        amount: 5000,
        method: 'Visa ....4242',
      }),
    ).toThrow(BadRequestException);
  });

  it('adds a clinical log entry with pending review status', () => {
    const logEntry = service.logClinicalHours('student-amara-singh', {
      date: '2026-06-30',
      moduleId: 'm3',
      moduleTitle: 'Vital Signs & Monitoring',
      hours: 4,
      instructor: 'Lisa Wong',
      note: 'Observed bedside charting and vitals workflow.',
    });

    expect(logEntry.status).toBe('Pending');
    expect(logEntry.hours).toBe(4);
  });

  it('submits the entrance exam for manual review', () => {
    service.answerEntranceExamQuestion('student-amara-singh', 'q1', { answer: 'B. Read instructions and finish work' });
    service.answerEntranceExamQuestion('student-amara-singh', 'q2', { answer: 'B. To understand lessons and exams' });
    service.answerEntranceExamQuestion('student-amara-singh', 'q3', { answer: 'C. During scheduled support hours' });
    service.answerEntranceExamQuestion('student-amara-singh', 'q4', { answer: 'B. They may fail assignments or exams' });
    service.answerEntranceExamQuestion('student-amara-singh', 'q5', { answer: 'B. English comprehension is required to succeed' });
    service.answerEntranceExamQuestion('student-amara-singh', 'q6', {
      answer: 'Following instructions is crucial in healthcare to ensure patient safety and quality care.',
    });

    const exam = service.submitEntranceExam('student-amara-singh');
    const intake = service.getIntake('student-amara-singh');

    expect(exam.score).toBeNull();
    expect(exam.rank).toBeNull();
    expect(exam.passed).toBe(false);
    expect(intake.workflowStage).toBe('admin_review');
    expect(intakeSubmissionService.getStudentApprovalStatus('student-amara-singh')).toBe('pending');
    expect(intakeSubmissionService.getStudentSubmission('student-amara-singh')?.questions).toHaveLength(6);
  });

  it('blocks enrollment until admin approves the intake', () => {
    expect(() =>
      service.updateEnrollmentWizard('student-amara-singh', {
        scrubTop: 'M',
      }),
    ).toThrow(BadRequestException);
  });

  it('unlocks enrollment after admin approval', () => {
    const submission = intakeSubmissionService.submitIntake('student-amara-singh', {
      entranceExamScore: null,
      entranceExamPassed: null,
      passingScore: 5,
      questions: [
        {
          questionId: 'q1',
          prompt: 'Question 1',
          type: 'choice',
          preferredAnswer: 'A',
          options: [{ label: 'A', value: 'A' }],
          studentAnswer: 'A',
          reviewStatus: 'pending',
        },
      ],
      enrollmentData: service.getIntake('student-amara-singh').enrollmentWizard,
    });
    const approvedSubmission = intakeSubmissionService.approveIntake(submission.id, 'admin-001', { q1: 'correct' });
    service.markIntakeApproved('student-amara-singh', {
      score: approvedSubmission.entranceExamScore,
      passed: approvedSubmission.entranceExamPassed,
      totalQuestions: approvedSubmission.questions.length,
    });

    const enrollment = service.updateEnrollmentWizard('student-amara-singh', {
      scrubTop: 'M',
    });

    expect(enrollment.scrubTop).toBe('M');
  });

  it('moves approved students to orientation survey after enrollment wizard submission', () => {
    const submission = intakeSubmissionService.submitIntake('student-amara-singh', {
      entranceExamScore: null,
      entranceExamPassed: null,
      passingScore: 5,
      questions: [
        {
          questionId: 'q1',
          prompt: 'Question 1',
          type: 'choice',
          preferredAnswer: 'A',
          options: [{ label: 'A', value: 'A' }],
          studentAnswer: 'A',
          reviewStatus: 'pending',
        },
      ],
      enrollmentData: service.getIntake('student-amara-singh').enrollmentWizard,
    });

    const approvedSubmission = intakeSubmissionService.approveIntake(submission.id, 'admin-001', { q1: 'correct' });
    service.markIntakeApproved('student-amara-singh', {
      score: approvedSubmission.entranceExamScore,
      passed: approvedSubmission.entranceExamPassed,
      totalQuestions: approvedSubmission.questions.length,
    });

    service.updateEnrollmentWizard('student-amara-singh', {
      scrubTop: 'M',
      scrubBottom: 'M',
      shipping: 'pickup',
      wantsToTestAtDaisy: true,
      signature: 'Amara Singh',
    });
    service.updateEnrollmentWizardAgreements('student-amara-singh', {
      ip: true,
      refund: true,
      conduct: true,
      lateFee: true,
    });

    service.submitEnrollmentWizard('student-amara-singh');

    expect(service.getIntake('student-amara-singh').workflowStage).toBe('orientation_survey');
  });

  it('rescues already-approved students stuck in admin review after enrollment submission', () => {
    const submission = intakeSubmissionService.submitIntake('student-amara-singh', {
      entranceExamScore: null,
      entranceExamPassed: null,
      passingScore: 5,
      questions: [
        {
          questionId: 'q1',
          prompt: 'Question 1',
          type: 'choice',
          preferredAnswer: 'A',
          options: [{ label: 'A', value: 'A' }],
          studentAnswer: 'A',
          reviewStatus: 'pending',
        },
      ],
      enrollmentData: service.getIntake('student-amara-singh').enrollmentWizard,
    });

    const approvedSubmission = intakeSubmissionService.approveIntake(submission.id, 'admin-001', { q1: 'correct' });
    service.markIntakeApproved('student-amara-singh', {
      score: approvedSubmission.entranceExamScore,
      passed: approvedSubmission.entranceExamPassed,
      totalQuestions: approvedSubmission.questions.length,
    });

    service.updateEnrollmentWizard('student-amara-singh', {
      scrubTop: 'M',
      scrubBottom: 'M',
      shipping: 'pickup',
      wantsToTestAtDaisy: true,
      signature: 'Amara Singh',
    });
    service.updateEnrollmentWizardAgreements('student-amara-singh', {
      ip: true,
      refund: true,
      conduct: true,
      lateFee: true,
    });
    service.submitEnrollmentWizard('student-amara-singh');
    service.setWorkflowStage('student-amara-singh', 'admin_review');

    expect(service.getPortal('student-amara-singh').workflowStage).toBe('orientation_survey');
  });

  it('preserves completed intake state after service restart', () => {
    const submission = intakeSubmissionService.submitIntake('student-amara-singh', {
      entranceExamScore: null,
      entranceExamPassed: null,
      passingScore: 5,
      questions: [
        {
          questionId: 'q1',
          prompt: 'Question 1',
          type: 'choice',
          preferredAnswer: 'A',
          options: [{ label: 'A', value: 'A' }],
          studentAnswer: 'A',
          reviewStatus: 'pending',
        },
      ],
      enrollmentData: service.getIntake('student-amara-singh').enrollmentWizard,
    });

    const approvedSubmission = intakeSubmissionService.approveIntake(submission.id, 'admin-001', { q1: 'correct' });
    service.markIntakeApproved('student-amara-singh', {
      score: approvedSubmission.entranceExamScore,
      passed: approvedSubmission.entranceExamPassed,
      totalQuestions: approvedSubmission.questions.length,
    });

    service.updateEnrollmentWizard('student-amara-singh', {
      scrubTop: 'M',
      scrubBottom: 'M',
      shipping: 'pickup',
      wantsToTestAtDaisy: true,
      signature: 'Amara Singh',
    });
    service.updateEnrollmentWizardAgreements('student-amara-singh', {
      ip: true,
      refund: true,
      conduct: true,
      lateFee: true,
    });
    service.submitEnrollmentWizard('student-amara-singh');
    service.answerEntranceSurveyQuestion('student-amara-singh', 'support_system', {
      answer: 'Support team and instructor.',
    });
    service.submitEntranceSurvey('student-amara-singh');

    const reloadedExamConfigService = new ExamConfigService();
    const reloadedIntakeSubmissionService = new IntakeSubmissionService();
    const reloadedService = new StudentPortalService(
      new StudentPortalRepository(reloadedExamConfigService, new LearningResourcesConfigService()),
      reloadedExamConfigService,
      reloadedIntakeSubmissionService,
    );
    const reloadedPortal = reloadedService.getPortal('student-amara-singh');

    expect(reloadedPortal.workflowStage).toBe('active');
    expect(reloadedPortal.entranceSurvey.completed).toBe(true);
  });

  it('requires each question to be reviewed before approval', () => {
    const submission = intakeSubmissionService.submitIntake('student-amara-singh', {
      entranceExamScore: null,
      entranceExamPassed: null,
      passingScore: 1,
      questions: [
        {
          questionId: 'q1',
          prompt: 'Question 1',
          type: 'text',
          preferredAnswer: 'Preferred',
          options: [],
          studentAnswer: 'Student answer',
          reviewStatus: 'pending',
        },
      ],
      enrollmentData: service.getIntake('student-amara-singh').enrollmentWizard,
    });

    expect(() => intakeSubmissionService.approveIntake(submission.id, 'admin-001')).toThrow(BadRequestException);
  });

  it('updates settings and returns the saved preference values', () => {
    const settings = service.updateSettings('student-amara-singh', {
      sms_alerts: true,
      remember_device: false,
    });

    expect(settings.sms_alerts).toBe(true);
    expect(settings.remember_device).toBe(false);
  });

  it('requires a valid CDPH form before signing', () => {
    expect(() => service.signCdphForm('student-amara-singh')).toThrow(BadRequestException);
  });
});
