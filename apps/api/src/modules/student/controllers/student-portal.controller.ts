import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { Roles } from '../../../common/decorators/roles.decorator';
import { SupabaseAuthGuard } from '../../../common/auth/supabase-auth.guard';
import { createApiResponse } from '../../../common/utils/create-api-response';
import type {
  AdvanceLearningDto,
  AnswerOnboardingQuestionDto,
  AttendanceCheckInDto,
  LogClinicalHoursDto,
  RecordPaymentDto,
  RegisterCohortDto,
  ReplaceStudentDocumentDto,
  ReportAbsenceDto,
  SelectModuleDto,
  SendStudentMessageDto,
  SetLearningSessionDto,
  SubmitModuleExamDto,
  SubmitSupportTicketDto,
  TextAnswerDto,
  UpdateCdphFormDto,
  UpdateEnrollmentWizardAgreementsDto,
  UpdateEnrollmentWizardDto,
  UpdateOnboardingAcknowledgementsDto,
  UpdateReadinessUploadsDto,
  UpdateSettingDto,
  UpdateStudentProfileDto,
  StudentWorkflowStage,
  UpdateWizardStepDto,
  UploadStudentDocumentDto,
} from '../types/student-portal.types';
import { StudentPortalService } from '../services/student-portal.service';
import { IntakeSubmissionService } from '../services/intake-submission.service';

@Controller('students/:studentId')
@UseGuards(SupabaseAuthGuard)
@Roles('student')
export class StudentPortalController {
  constructor(
    private readonly studentPortalService: StudentPortalService,
    private readonly intakeSubmissionService: IntakeSubmissionService,
  ) {}

  @Get('portal')
  getPortal(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getPortal(studentId),
      'Student portal state retrieved successfully.',
    );
  }

  @Get('profile')
  getProfile(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getProfile(studentId),
      'Student profile retrieved successfully.',
    );
  }

  @Patch('profile')
  updateProfile(@Param('studentId') studentId: string, @Body() body: UpdateStudentProfileDto) {
    return createApiResponse(
      this.studentPortalService.updateProfile(studentId, body),
      'Student profile updated successfully.',
    );
  }

  @Get('cohorts')
  getCohorts(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getCohorts(studentId),
      'Available cohorts retrieved successfully.',
    );
  }

  @Post('cohorts/register')
  registerCohort(@Param('studentId') studentId: string, @Body() body: RegisterCohortDto) {
    return createApiResponse(
      this.studentPortalService.registerCohort(studentId, body),
      'Cohort registration completed successfully.',
    );
  }

  @Get('dashboard')
  getDashboard(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getDashboard(studentId),
      'Student dashboard retrieved successfully.',
    );
  }

  @Get('intake')
  getIntake(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getIntake(studentId),
      'Student intake state retrieved successfully.',
    );
  }

  @Patch('intake/workflow-stage')
  setWorkflowStage(
    @Param('studentId') studentId: string,
    @Body() body: { workflowStage: StudentWorkflowStage },
  ) {
    return createApiResponse(
      this.studentPortalService.setWorkflowStage(studentId, body.workflowStage),
      'Student workflow stage updated successfully.',
    );
  }

  @Patch('intake/entrance-exam/questions/:questionId')
  answerEntranceExamQuestion(
    @Param('studentId') studentId: string,
    @Param('questionId') questionId: string,
    @Body() body: TextAnswerDto,
  ) {
    return createApiResponse(
      this.studentPortalService.answerEntranceExamQuestion(studentId, questionId, body),
      'Entrance exam response updated successfully.',
    );
  }

  @Post('intake/entrance-exam/submit')
  submitEntranceExam(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.submitEntranceExam(studentId),
      'Entrance exam submitted successfully.',
    );
  }

  @Patch('intake/enrollment-wizard')
  updateEnrollmentWizard(@Param('studentId') studentId: string, @Body() body: UpdateEnrollmentWizardDto) {
    return createApiResponse(
      this.studentPortalService.updateEnrollmentWizard(studentId, body),
      'Enrollment wizard updated successfully.',
    );
  }

  @Patch('intake/enrollment-wizard/agreements')
  updateEnrollmentWizardAgreements(
    @Param('studentId') studentId: string,
    @Body() body: UpdateEnrollmentWizardAgreementsDto,
  ) {
    return createApiResponse(
      this.studentPortalService.updateEnrollmentWizardAgreements(studentId, body),
      'Enrollment agreements updated successfully.',
    );
  }

  @Patch('intake/enrollment-wizard/step')
  setEnrollmentWizardStep(@Param('studentId') studentId: string, @Body() body: UpdateWizardStepDto) {
    return createApiResponse(
      this.studentPortalService.setEnrollmentWizardStep(studentId, body),
      'Enrollment wizard step updated successfully.',
    );
  }

  @Post('intake/enrollment-wizard/submit')
  submitEnrollmentWizard(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.submitEnrollmentWizard(studentId),
      'Enrollment wizard submitted successfully.',
    );
  }

  @Patch('intake/entrance-survey/questions/:questionId')
  answerEntranceSurveyQuestion(
    @Param('studentId') studentId: string,
    @Param('questionId') questionId: string,
    @Body() body: TextAnswerDto,
  ) {
    return createApiResponse(
      this.studentPortalService.answerEntranceSurveyQuestion(studentId, questionId, body),
      'Entrance survey response updated successfully.',
    );
  }

  @Patch('intake/entrance-survey/step')
  setEntranceSurveyStep(@Param('studentId') studentId: string, @Body() body: UpdateWizardStepDto) {
    return createApiResponse(
      this.studentPortalService.setEntranceSurveyStep(studentId, body),
      'Entrance survey step updated successfully.',
    );
  }

  @Post('intake/entrance-survey/submit')
  submitEntranceSurvey(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.submitEntranceSurvey(studentId),
      'Entrance survey submitted successfully.',
    );
  }

  @Get('onboarding')
  getOnboarding(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getOnboarding(studentId),
      'Student onboarding state retrieved successfully.',
    );
  }

  @Patch('tasks/:taskId/toggle')
  toggleTask(@Param('studentId') studentId: string, @Param('taskId') taskId: string) {
    return createApiResponse(
      this.studentPortalService.toggleTask(studentId, taskId),
      'Student task updated successfully.',
    );
  }

  @Patch('onboarding/steps/:stepId/toggle')
  toggleOnboardingStep(@Param('studentId') studentId: string, @Param('stepId') stepId: string) {
    return createApiResponse(
      this.studentPortalService.toggleOnboardingStep(studentId, stepId),
      'Onboarding step updated successfully.',
    );
  }

  @Patch('onboarding/questions/:questionId')
  answerOnboardingQuestion(
    @Param('studentId') studentId: string,
    @Param('questionId') questionId: string,
    @Body() body: AnswerOnboardingQuestionDto,
  ) {
    return createApiResponse(
      this.studentPortalService.answerOnboardingQuestion(studentId, questionId, body),
      'Onboarding question updated successfully.',
    );
  }

  @Patch('onboarding/acknowledgements')
  updateOnboardingAcknowledgements(
    @Param('studentId') studentId: string,
    @Body() body: UpdateOnboardingAcknowledgementsDto,
  ) {
    return createApiResponse(
      this.studentPortalService.updateOnboardingAcknowledgements(studentId, body),
      'Onboarding acknowledgements updated successfully.',
    );
  }

  @Patch('onboarding/uploads')
  updateReadinessUploads(@Param('studentId') studentId: string, @Body() body: UpdateReadinessUploadsDto) {
    return createApiResponse(
      this.studentPortalService.updateReadinessUploads(studentId, body),
      'Onboarding readiness uploads updated successfully.',
    );
  }

  @Post('onboarding/submit')
  submitOnboarding(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.submitOnboarding(studentId),
      'Onboarding submitted successfully.',
    );
  }

  @Get('curriculum')
  getCurriculum(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getCurriculum(studentId),
      'Student curriculum retrieved successfully.',
    );
  }

  @Get('learning')
  getLearning(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getLearning(studentId),
      'Student learning state retrieved successfully.',
    );
  }

  @Post('learning/advance')
  advanceLearning(@Param('studentId') studentId: string, @Body() body: AdvanceLearningDto) {
    return createApiResponse(
      this.studentPortalService.advanceLearning(studentId, body),
      'Student learning progress updated successfully.',
    );
  }

  @Post('learning/session/toggle')
  toggleLearningSession(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.toggleLearningSession(studentId),
      'Learning session toggled successfully.',
    );
  }

  @Patch('learning/session')
  setLearningSession(@Param('studentId') studentId: string, @Body() body: SetLearningSessionDto) {
    return createApiResponse(
      this.studentPortalService.setLearningSession(studentId, body),
      'Learning session updated successfully.',
    );
  }

  @Patch('learning/modules/active')
  selectModule(@Param('studentId') studentId: string, @Body() body: SelectModuleDto) {
    return createApiResponse(
      this.studentPortalService.selectModule(studentId, body),
      'Active learning module updated successfully.',
    );
  }

  @Patch('learning/modules/:moduleId/steps/:stepId/toggle')
  toggleModuleStep(
    @Param('studentId') studentId: string,
    @Param('moduleId') moduleId: string,
    @Param('stepId') stepId: string,
  ) {
    return createApiResponse(
      this.studentPortalService.toggleModuleStep(studentId, moduleId, stepId),
      'Learning step updated successfully.',
    );
  }

  @Post('learning/modules/:moduleId/exam')
  submitModuleExam(
    @Param('studentId') studentId: string,
    @Param('moduleId') moduleId: string,
    @Body() body: SubmitModuleExamDto,
  ) {
    return createApiResponse(
      this.studentPortalService.submitModuleExam(studentId, moduleId, body),
      'Module exam submitted successfully.',
    );
  }

  @Post('learning/textbook/open')
  openTextbook(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.openTextbook(studentId),
      'Textbook opened successfully.',
    );
  }

  @Post('learning/exit-survey/complete')
  completeExitSurvey(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.completeExitSurvey(studentId),
      'Exit survey completed successfully.',
    );
  }

  @Get('progress')
  getProgress(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getProgress(studentId),
      'Student progress retrieved successfully.',
    );
  }

  @Get('messages')
  getMessages(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getMessages(studentId),
      'Student messages retrieved successfully.',
    );
  }

  @Patch('messages/:threadId/select')
  selectThread(@Param('studentId') studentId: string, @Param('threadId') threadId: string) {
    return createApiResponse(
      this.studentPortalService.selectThread(studentId, threadId),
      'Student message thread selected successfully.',
    );
  }

  @Post('messages')
  sendMessage(@Param('studentId') studentId: string, @Body() body: SendStudentMessageDto) {
    return createApiResponse(
      this.studentPortalService.sendMessage(studentId, body),
      'Student message sent successfully.',
    );
  }

  @Get('clinical-hours')
  getClinicalHours(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getClinicalHours(studentId),
      'Student clinical hours retrieved successfully.',
    );
  }

  @Post('clinical-hours/logs')
  logClinicalHours(@Param('studentId') studentId: string, @Body() body: LogClinicalHoursDto) {
    return createApiResponse(
      this.studentPortalService.logClinicalHours(studentId, body),
      'Clinical hours logged successfully.',
    );
  }

  @Get('attendance')
  getAttendance(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getAttendance(studentId),
      'Student attendance retrieved successfully.',
    );
  }

  @Post('attendance/check-in')
  checkIn(@Param('studentId') studentId: string, @Body() body: AttendanceCheckInDto) {
    return createApiResponse(
      this.studentPortalService.checkIn(studentId, body),
      'Student attendance check-in recorded successfully.',
    );
  }

  @Post('attendance/absences')
  reportAbsence(@Param('studentId') studentId: string, @Body() body: ReportAbsenceDto) {
    return createApiResponse(
      this.studentPortalService.reportAbsence(studentId, body),
      'Student absence reported successfully.',
    );
  }

  @Post('reflections')
  submitReflection(@Param('studentId') studentId: string, @Body() body: TextAnswerDto) {
    return createApiResponse(
      this.studentPortalService.submitReflection(studentId, body),
      'Student reflection submitted successfully.',
    );
  }

  @Post('daily-question')
  submitQuestionAnswer(@Param('studentId') studentId: string, @Body() body: TextAnswerDto) {
    return createApiResponse(
      this.studentPortalService.submitQuestionAnswer(studentId, body),
      'Student question response submitted successfully.',
    );
  }

  @Get('financials')
  getFinancials(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getFinancials(studentId),
      'Student financials retrieved successfully.',
    );
  }

  @Post('financials/payments')
  recordPayment(@Param('studentId') studentId: string, @Body() body: RecordPaymentDto) {
    return createApiResponse(
      this.studentPortalService.recordPayment(studentId, body),
      'Student payment recorded successfully.',
    );
  }

  @Post('financials/payments/next')
  completeNextPayment(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.completeNextScheduledPayment(studentId),
      'Next scheduled student payment recorded successfully.',
    );
  }

  @Get('documents')
  getDocuments(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getDocuments(studentId),
      'Student documents retrieved successfully.',
    );
  }

  @Post('documents/upload')
  uploadDocument(@Param('studentId') studentId: string, @Body() body: UploadStudentDocumentDto) {
    return createApiResponse(
      this.studentPortalService.uploadDocument(studentId, body),
      'Student document uploaded successfully.',
    );
  }

  @Patch('documents/:documentId/replace')
  replaceDocument(
    @Param('studentId') studentId: string,
    @Param('documentId') documentId: string,
    @Body() body: ReplaceStudentDocumentDto,
  ) {
    return createApiResponse(
      this.studentPortalService.replaceDocument(studentId, documentId, body),
      'Student document replaced successfully.',
    );
  }

  @Get('forms')
  getForms(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getForms(studentId),
      'Student forms workspace retrieved successfully.',
    );
  }

  @Post('forms/live-scan/generate')
  generateLiveScan(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.generateLiveScan(studentId),
      'Live Scan form generated successfully.',
    );
  }

  @Post('forms/live-scan/toggle-upload')
  toggleLiveScanUpload(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.toggleLiveScanUpload(studentId),
      'Live Scan upload state updated successfully.',
    );
  }

  @Patch('forms/cdph-283b')
  updateCdphForm(@Param('studentId') studentId: string, @Body() body: UpdateCdphFormDto) {
    return createApiResponse(
      this.studentPortalService.updateCdphForm(studentId, body),
      'CDPH form updated successfully.',
    );
  }

  @Post('forms/cdph-283b/sign')
  signCdphForm(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.signCdphForm(studentId),
      'CDPH form signed successfully.',
    );
  }

  @Get('settings')
  getSettings(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getSettings(studentId),
      'Student settings retrieved successfully.',
    );
  }

  @Patch('settings')
  updateSettings(@Param('studentId') studentId: string, @Body() body: UpdateSettingDto) {
    return createApiResponse(
      this.studentPortalService.updateSettings(studentId, body),
      'Student settings updated successfully.',
    );
  }

  @Get('assignments')
  getAssignments(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getAssignments(studentId),
      'Student assignments retrieved successfully.',
    );
  }

  @Post('assignments/:assignmentId/submit')
  submitAssignment(@Param('studentId') studentId: string, @Param('assignmentId') assignmentId: string) {
    return createApiResponse(
      this.studentPortalService.submitAssignment(studentId, assignmentId),
      'Student assignment submitted successfully.',
    );
  }

  @Get('support')
  getSupport(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getSupport(studentId),
      'Student support tickets retrieved successfully.',
    );
  }

  @Post('support')
  submitSupportTicket(@Param('studentId') studentId: string, @Body() body: SubmitSupportTicketDto) {
    return createApiResponse(
      this.studentPortalService.submitSupportTicket(studentId, body),
      'Student support ticket submitted successfully.',
    );
  }

  @Get('certificates')
  getCertificates(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.getCertificates(studentId),
      'Student certificate status retrieved successfully.',
    );
  }

  @Post('intake/submit')
  submitIntake(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.studentPortalService.submitEntranceExam(studentId),
      'Student intake submitted for admin review.',
    );
  }

  @Get('intake/approval-status')
  getApprovalStatus(@Param('studentId') studentId: string) {
    return createApiResponse(
      this.intakeSubmissionService.getStudentApprovalSummary(studentId),
      'Student intake approval status retrieved successfully.',
    );
  }
}
