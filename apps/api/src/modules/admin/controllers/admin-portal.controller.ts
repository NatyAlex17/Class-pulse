import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';

import { SupabaseAuthGuard } from '../../../common/auth/supabase-auth.guard';
import { createApiResponse } from '../../../common/utils/create-api-response';
import { LEARNING_RESOURCES_UPLOADS_DIR, UPLOADS_URL_PREFIX } from '../../../common/utils/upload-paths';
import { ExamConfigService, type EntranceExamConfig } from '../../student/services/exam-config.service';
import { EnrollmentWizardConfigService, type EnrollmentWizardConfig } from '../../student/services/enrollment-wizard-config.service';
import {
  LearningResourcesConfigService,
  type LearningResourcesConfig,
} from '../../student/services/learning-resources-config.service';
import { OrientationSurveyConfigService, type OrientationSurveyConfig } from '../../student/services/orientation-survey-config.service';
import { CohortsConfigService, type CohortsConfig } from '../../student/services/cohorts-config.service';
import {
  DocumentRequirementsConfigService,
  type DocumentRequirementsConfig,
} from '../../student/services/document-requirements-config.service';
import { IntakeSubmissionService } from '../../student/services/intake-submission.service';
import { StudentPortalService } from '../../student/services/student-portal.service';
import type { ApproveIntakeDto, ReplySupportTicketDto } from '../../student/types/student-portal.types';
import { InstructorIntakeSubmissionService } from '../../instructor/services/instructor-intake-submission.service';
import {
  InstructorOnboardingQuestionsConfigService,
  type InstructorOnboardingQuestionsConfig,
} from '../../instructor/services/instructor-onboarding-questions-config.service';
import { InstructorPortalService } from '../../instructor/services/instructor-portal.service';
import type { ApproveInstructorIntakeDto } from '../../instructor/types/instructor-portal.types';
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
    private readonly cohortsConfigService: CohortsConfigService,
    private readonly documentRequirementsConfigService: DocumentRequirementsConfigService,
    private readonly intakeSubmissionService: IntakeSubmissionService,
    private readonly studentPortalService: StudentPortalService,
    private readonly instructorPortalService: InstructorPortalService,
    private readonly instructorIntakeSubmissionService: InstructorIntakeSubmissionService,
    private readonly instructorOnboardingQuestionsConfigService: InstructorOnboardingQuestionsConfigService,
  ) {}

  @Get('portal')
  getPortal(@Param('adminId') adminId: string) {
    return createApiResponse(
      this.adminPortalService.getPortal(adminId),
      'Admin portal state retrieved successfully.',
    );
  }

  @Get('profile')
  getProfile(@Param('adminId') adminId: string) {
    return createApiResponse(
      this.adminPortalService.getProfile(adminId),
      'Admin profile retrieved successfully.',
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
  getReports(@Param('adminId') adminId: string, @Query('range') range?: '7d' | '30d' | 'quarter') {
    return createApiResponse(
      this.adminPortalService.getReports(adminId, range ?? '30d'),
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
  @Get('instructor-onboarding-questions-config')
  getInstructorOnboardingQuestionsConfig() {
    return createApiResponse(
      this.instructorOnboardingQuestionsConfigService.getConfig(),
      'Instructor onboarding questions configuration retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('instructor-onboarding-questions-config')
  updateInstructorOnboardingQuestionsConfig(@Body() config: InstructorOnboardingQuestionsConfig) {
    return createApiResponse(
      this.instructorOnboardingQuestionsConfigService.updateConfig(config),
      'Instructor onboarding questions configuration updated successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('instructor-onboarding-questions-config/reset')
  resetInstructorOnboardingQuestionsConfig() {
    return createApiResponse(
      this.instructorOnboardingQuestionsConfigService.resetToDefault(),
      'Instructor onboarding questions configuration reset to default successfully.',
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
  @Get('cohorts-config')
  getCohortsConfig() {
    return createApiResponse(
      this.cohortsConfigService.getConfig(),
      'Cohorts configuration retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('cohorts-config')
  updateCohortsConfig(@Body() config: CohortsConfig) {
    return createApiResponse(
      this.cohortsConfigService.updateConfig(config),
      'Cohorts configuration updated successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('cohorts-config/reset')
  resetCohortsConfig() {
    return createApiResponse(
      this.cohortsConfigService.resetToDefault(),
      'Cohorts configuration reset to default successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('document-requirements-config')
  getDocumentRequirementsConfig() {
    return createApiResponse(
      this.documentRequirementsConfigService.getConfig(),
      'Document requirements configuration retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('document-requirements-config')
  updateDocumentRequirementsConfig(@Body() config: DocumentRequirementsConfig) {
    return createApiResponse(
      this.documentRequirementsConfigService.updateConfig(config),
      'Document requirements configuration updated successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('document-requirements-config/reset')
  resetDocumentRequirementsConfig() {
    return createApiResponse(
      this.documentRequirementsConfigService.resetToDefault(),
      'Document requirements configuration reset to default successfully.',
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
  @Post('learning-resources-config/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          fs.mkdirSync(LEARNING_RESOURCES_UPLOADS_DIR, { recursive: true });
          callback(null, LEARNING_RESOURCES_UPLOADS_DIR);
        },
        filename: (_req, file, callback) => {
          const extension = path.extname(file.originalname).toLowerCase();
          const baseName =
            path
              .basename(file.originalname, extension)
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') || 'file';
          callback(null, `${Date.now()}-${baseName}${extension}`);
        },
      }),
      limits: { fileSize: 500 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (file.mimetype.startsWith('video/') || file.mimetype === 'application/pdf') {
          callback(null, true);
        } else {
          callback(new BadRequestException('Only video files and PDF documents can be uploaded.'), false);
        }
      },
    }),
  )
  uploadLearningResourceFile(@UploadedFile() file: Express.Multer.File | undefined, @Req() request: Request) {
    if (!file) {
      throw new BadRequestException('No file received. Attach a file under the "file" field.');
    }

    const baseUrl = `${request.protocol}://${request.get('host')}`;

    return createApiResponse(
      {
        url: `${baseUrl}${UPLOADS_URL_PREFIX}/learning-resources/${file.filename}`,
        fileName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      },
      'File uploaded successfully.',
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
      this.intakeSubmissionService.getPendingSubmissions().map((submission) => this.withStudentName(submission)),
      'Pending student intake submissions retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('intake/submissions')
  getAllIntakeSubmissions() {
    return createApiResponse(
      this.intakeSubmissionService.getAllSubmissions().map((submission) => this.withStudentName(submission)),
      'Student intake submissions retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('intake/submissions/:submissionId')
  getIntakeSubmissionById(@Param('submissionId') submissionId: string) {
    const submission = this.intakeSubmissionService.getSubmission(submissionId);

    if (!submission) {
      throw new NotFoundException('Intake submission not found.');
    }

    return createApiResponse(this.withStudentName(submission), 'Student intake submission retrieved successfully.');
  }

  private withStudentName<T extends { studentId: string }>(
    submission: T,
  ): T & { studentName: string; studentEmail?: string } {
    try {
      const profile = this.studentPortalService.getProfile(submission.studentId);
      return { ...submission, studentName: profile.fullName, studentEmail: profile.email };
    } catch {
      return { ...submission, studentName: submission.studentId };
    }
  }

  private withInstructorName<T extends { instructorId: string }>(
    submission: T,
  ): T & { instructorName: string; instructorEmail?: string } {
    try {
      const profile = this.instructorPortalService.getProfile(submission.instructorId);
      return { ...submission, instructorName: profile.fullName, instructorEmail: profile.email };
    } catch {
      return { ...submission, instructorName: submission.instructorId };
    }
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('intake/submissions/:submissionId/approve')
  approveIntakeSubmission(
    @Param('adminId') adminId: string,
    @Param('submissionId') submissionId: string,
    @Body() body: ApproveIntakeDto,
  ) {
    if (body.approved) {
      const submission = this.intakeSubmissionService.approveIntake(
        submissionId,
        adminId,
        body.questionReviews,
        body.documentReviews,
      );
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
        body.documentReviews,
      );
      this.studentPortalService.markIntakeRejected(submission.studentId, submission.rejectionReason || 'Rejected');

      return createApiResponse(
        submission,
        'Student intake rejected successfully.',
      );
    }
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('security-violations')
  getSecurityViolationsLog() {
    return createApiResponse(
      this.studentPortalService.getSecurityViolationsLog(),
      'Student security violation log retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('support-tickets')
  getAllSupportTickets() {
    return createApiResponse(
      this.studentPortalService.getAllSupportTickets().map((ticket) => this.withStudentName(ticket)),
      'Student support tickets retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('support-tickets/:studentId/:ticketId')
  getSupportTicketById(@Param('studentId') studentId: string, @Param('ticketId') ticketId: string) {
    const ticket = this.studentPortalService.getSupportTicket(studentId, ticketId);
    return createApiResponse(
      this.withStudentName({ ...ticket, studentId }),
      'Support ticket retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('support-tickets/:studentId/:ticketId/reply')
  replySupportTicket(
    @Param('adminId') adminId: string,
    @Param('studentId') studentId: string,
    @Param('ticketId') ticketId: string,
    @Body() body: ReplySupportTicketDto,
  ) {
    const ticket = this.studentPortalService.replyToSupportTicket(studentId, ticketId, adminId, body);
    return createApiResponse(
      this.withStudentName({ ...ticket, studentId }),
      'Support ticket reply sent successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('instructor-intake/pending-submissions')
  getPendingInstructorSubmissions() {
    return createApiResponse(
      this.instructorIntakeSubmissionService.getPendingSubmissions().map((submission) => this.withInstructorName(submission)),
      'Pending instructor onboarding submissions retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('instructor-intake/submissions')
  getAllInstructorSubmissions() {
    return createApiResponse(
      this.instructorIntakeSubmissionService.getAllSubmissions().map((submission) => this.withInstructorName(submission)),
      'Instructor onboarding submissions retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('instructor-intake/submissions/:submissionId')
  getInstructorSubmissionById(@Param('submissionId') submissionId: string) {
    const submission = this.instructorIntakeSubmissionService.getSubmission(submissionId);

    if (!submission) {
      throw new NotFoundException('Instructor onboarding submission not found.');
    }

    return createApiResponse(
      this.withInstructorName(submission),
      'Instructor onboarding submission retrieved successfully.',
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('instructor-intake/submissions/:submissionId/approve')
  approveInstructorSubmission(
    @Param('adminId') adminId: string,
    @Param('submissionId') submissionId: string,
    @Body() body: ApproveInstructorIntakeDto,
  ) {
    if (body.approved) {
      const submission = this.instructorIntakeSubmissionService.approveIntake(
        submissionId,
        adminId,
        body.documentReviews,
      );
      this.instructorPortalService.markOnboardingApproved(submission.instructorId);

      return createApiResponse(submission, 'Instructor onboarding approved successfully.');
    } else {
      const submission = this.instructorIntakeSubmissionService.rejectIntake(
        submissionId,
        adminId,
        body.rejectionReason || 'Rejected',
        body.documentReviews,
      );
      this.instructorPortalService.markOnboardingRejected(
        submission.instructorId,
        submission.rejectionReason || 'Rejected',
      );

      return createApiResponse(submission, 'Instructor onboarding rejected successfully.');
    }
  }
}
