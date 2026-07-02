import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { SupabaseAuthGuard } from '../../../common/auth/supabase-auth.guard';
import { createApiResponse } from '../../../common/utils/create-api-response';
import { ExamConfigService, type EntranceExamConfig } from '../../student/services/exam-config.service';
import { EnrollmentWizardConfigService, type EnrollmentWizardConfig } from '../../student/services/enrollment-wizard-config.service';
import {
  LearningResourcesConfigService,
  type LearningResourcesConfig,
} from '../../student/services/learning-resources-config.service';
import { OrientationSurveyConfigService, type OrientationSurveyConfig } from '../../student/services/orientation-survey-config.service';
import { IntakeSubmissionService } from '../../student/services/intake-submission.service';
import { StudentPortalService } from '../../student/services/student-portal.service';
import type { ApproveIntakeDto } from '../../student/types/student-portal.types';
import type {
  AddAdminApplicationNoteDto,
  GenerateAdminReportExportDto,
  UpdateAdminApplicationStatusDto,
  UploadAdminDocumentDto,
} from '../types/admin-portal.types';
import { AdminPortalService } from '../services/admin-portal.service';

@Controller('admins/:adminId')
export class AdminPortalController {
  constructor(
    private readonly adminPortalService: AdminPortalService,
    private readonly examConfigService: ExamConfigService,
    private readonly enrollmentWizardConfigService: EnrollmentWizardConfigService,
    private readonly learningResourcesConfigService: LearningResourcesConfigService,
    private readonly orientationSurveyConfigService: OrientationSurveyConfigService,
    private readonly intakeSubmissionService: IntakeSubmissionService,
    private readonly studentPortalService: StudentPortalService,
  ) {}

  @Get('portal')
  getPortal(@Param('adminId') adminId: string) {
    return createApiResponse(
      this.adminPortalService.getPortal(adminId),
      'Admin portal state retrieved successfully.',
    );
  }

  @Get('dashboard')
  getDashboard(@Param('adminId') adminId: string) {
    return createApiResponse(
      this.adminPortalService.getDashboard(adminId),
      'Admin dashboard retrieved successfully.',
    );
  }

  @Get('operations')
  getOperations(@Param('adminId') adminId: string) {
    return createApiResponse(
      this.adminPortalService.getOperations(adminId),
      'Admin operations snapshot retrieved successfully.',
    );
  }

  @Get('applications')
  getApplications(@Param('adminId') adminId: string) {
    return createApiResponse(
      this.adminPortalService.getApplications(adminId),
      'Admin applications retrieved successfully.',
    );
  }

  @Get('applications/:applicationId')
  getApplication(@Param('adminId') adminId: string, @Param('applicationId') applicationId: string) {
    return createApiResponse(
      this.adminPortalService.getApplication(adminId, applicationId),
      'Admin application retrieved successfully.',
    );
  }

  @Patch('applications/:applicationId/select')
  setActiveApplication(@Param('adminId') adminId: string, @Param('applicationId') applicationId: string) {
    return createApiResponse(
      this.adminPortalService.setActiveApplication(adminId, applicationId),
      'Active admin application updated successfully.',
    );
  }

  @Patch('applications/:applicationId/status')
  updateApplicationStatus(
    @Param('adminId') adminId: string,
    @Param('applicationId') applicationId: string,
    @Body() body: UpdateAdminApplicationStatusDto,
  ) {
    return createApiResponse(
      this.adminPortalService.updateApplicationStatus(adminId, applicationId, body),
      'Admin application status updated successfully.',
    );
  }

  @Post('applications/:applicationId/notes')
  addApplicationNote(
    @Param('adminId') adminId: string,
    @Param('applicationId') applicationId: string,
    @Body() body: AddAdminApplicationNoteDto,
  ) {
    return createApiResponse(
      this.adminPortalService.addApplicationNote(adminId, applicationId, body),
      'Admin application note added successfully.',
    );
  }

  @Get('review-queue')
  getReviewQueue(@Param('adminId') adminId: string) {
    return createApiResponse(
      this.adminPortalService.getReviewQueue(adminId),
      'Admin review queue retrieved successfully.',
    );
  }

  @Patch('review-queue/:queueId/select')
  setActiveReviewQueue(@Param('adminId') adminId: string, @Param('queueId') queueId: string) {
    return createApiResponse(
      this.adminPortalService.setActiveReviewQueue(adminId, queueId),
      'Active admin review queue item updated successfully.',
    );
  }

  @Get('reports')
  getReports(@Param('adminId') adminId: string) {
    return createApiResponse(
      this.adminPortalService.getReports(adminId),
      'Admin reports retrieved successfully.',
    );
  }

  @Post('reports/exports')
  generateReportExport(@Param('adminId') adminId: string, @Body() body: GenerateAdminReportExportDto) {
    return createApiResponse(
      this.adminPortalService.generateReportExport(adminId, body),
      'Admin report export generated successfully.',
    );
  }

  @Get('documents')
  getDocuments(@Param('adminId') adminId: string) {
    return createApiResponse(
      this.adminPortalService.getDocuments(adminId),
      'Admin documents retrieved successfully.',
    );
  }

  @Post('documents')
  uploadDocument(@Param('adminId') adminId: string, @Body() body: UploadAdminDocumentDto) {
    return createApiResponse(
      this.adminPortalService.uploadDocument(adminId, body),
      'Admin document uploaded successfully.',
    );
  }

  @Get('cohorts')
  getCohorts(@Param('adminId') adminId: string) {
    return createApiResponse(
      this.adminPortalService.getCohorts(adminId),
      'Admin cohorts retrieved successfully.',
    );
  }

  @Get('curriculum')
  getCurriculumSummary(@Param('adminId') adminId: string) {
    return createApiResponse(
      this.adminPortalService.getCurriculumSummary(adminId),
      'Admin curriculum summary retrieved successfully.',
    );
  }

  @Get('financials')
  getFinancialSummary(@Param('adminId') adminId: string) {
    return createApiResponse(
      this.adminPortalService.getFinancialSummary(adminId),
      'Admin financial summary retrieved successfully.',
    );
  }

  @Get('settings')
  getSettingsSummary(@Param('adminId') adminId: string) {
    return createApiResponse(
      this.adminPortalService.getSettingsSummary(adminId),
      'Admin settings summary retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('exam-config')
  getExamConfig() {
    return createApiResponse(
      this.examConfigService.getConfig(),
      'Entrance exam configuration retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('exam-config')
  updateExamConfig(@Body() config: EntranceExamConfig) {
    return createApiResponse(
      this.examConfigService.updateConfig(config),
      'Entrance exam configuration updated successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('exam-config/reset')
  resetExamConfig() {
    return createApiResponse(
      this.examConfigService.resetToDefault(),
      'Entrance exam configuration reset to default successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('enrollment-wizard-config')
  getEnrollmentWizardConfig() {
    return createApiResponse(
      this.enrollmentWizardConfigService.getConfig(),
      'Enrollment wizard configuration retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('enrollment-wizard-config')
  updateEnrollmentWizardConfig(@Body() config: EnrollmentWizardConfig) {
    return createApiResponse(
      this.enrollmentWizardConfigService.updateConfig(config),
      'Enrollment wizard configuration updated successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('enrollment-wizard-config/reset')
  resetEnrollmentWizardConfig() {
    return createApiResponse(
      this.enrollmentWizardConfigService.resetToDefault(),
      'Enrollment wizard configuration reset to default successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('learning-resources-config')
  getLearningResourcesConfig() {
    return createApiResponse(
      this.learningResourcesConfigService.getConfig(),
      'Learning resources configuration retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('learning-resources-config')
  updateLearningResourcesConfig(@Body() config: LearningResourcesConfig) {
    return createApiResponse(
      this.learningResourcesConfigService.updateConfig(config),
      'Learning resources configuration updated successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('learning-resources-config/reset')
  resetLearningResourcesConfig() {
    return createApiResponse(
      this.learningResourcesConfigService.resetToDefault(),
      'Learning resources configuration reset to default successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('orientation-survey-config')
  getOrientationSurveyConfig() {
    return createApiResponse(
      this.orientationSurveyConfigService.getConfig(),
      'Orientation survey configuration retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('orientation-survey-config')
  updateOrientationSurveyConfig(@Body() config: OrientationSurveyConfig) {
    return createApiResponse(
      this.orientationSurveyConfigService.updateConfig(config),
      'Orientation survey configuration updated successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('orientation-survey-config/reset')
  resetOrientationSurveyConfig() {
    return createApiResponse(
      this.orientationSurveyConfigService.resetToDefault(),
      'Orientation survey configuration reset to default successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('intake/pending-submissions')
  getPendingSubmissions() {
    return createApiResponse(
      this.intakeSubmissionService.getPendingSubmissions(),
      'Pending student intake submissions retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('intake/submissions/:submissionId/approve')
  approveIntakeSubmission(
    @Param('adminId') adminId: string,
    @Param('submissionId') submissionId: string,
    @Body() body: ApproveIntakeDto,
  ) {
    if (body.approved) {
      const submission = this.intakeSubmissionService.approveIntake(submissionId, adminId, body.questionReviews);
      this.studentPortalService.markIntakeApproved(submission.studentId, {
        score: submission.entranceExamScore,
        passed: submission.entranceExamPassed,
        totalQuestions: submission.questions.length,
      });

      return createApiResponse(
        submission,
        'Student intake approved successfully.',
      );
    } else {
      const submission = this.intakeSubmissionService.rejectIntake(
        submissionId,
        adminId,
        body.rejectionReason || 'Rejected',
        body.questionReviews,
      );
      this.studentPortalService.markIntakeRejected(submission.studentId, submission.rejectionReason || 'Rejected');

      return createApiResponse(
        submission,
        'Student intake rejected successfully.',
      );
    }
  }
}
