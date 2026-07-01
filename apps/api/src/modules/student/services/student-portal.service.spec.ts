import { BadRequestException } from '@nestjs/common';

import { StudentPortalRepository } from './student-portal.repository';
import { StudentPortalService } from './student-portal.service';

describe('StudentPortalService', () => {
  let service: StudentPortalService;

  beforeEach(() => {
    service = new StudentPortalService(new StudentPortalRepository());
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

  it('passes the entrance exam when enough correct answers are submitted', () => {
    service.answerEntranceExamQuestion('student-amara-singh', 'q1', { answer: 'B. Correct' });
    service.answerEntranceExamQuestion('student-amara-singh', 'q2', { answer: 'B. Correct' });
    service.answerEntranceExamQuestion('student-amara-singh', 'q3', { answer: 'C. Correct' });
    service.answerEntranceExamQuestion('student-amara-singh', 'q4', { answer: 'B. Correct' });
    service.answerEntranceExamQuestion('student-amara-singh', 'q6', { answer: 'I will follow directions carefully.' });

    const exam = service.submitEntranceExam('student-amara-singh');
    const intake = service.getIntake('student-amara-singh');

    expect(exam.passed).toBe(true);
    expect(intake.workflowStage).toBe('enrollment_wizard');
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
