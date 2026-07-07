import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';

import { createApiResponse } from '../../../common/utils/create-api-response';
import { INSTRUCTOR_READINESS_DOCUMENTS_UPLOADS_DIR, UPLOADS_URL_PREFIX } from '../../../common/utils/upload-paths';
import type {
  AddInstructorStudentNoteDto,
  AnswerInstructorOnboardingQuestionDto,
  AssignStudentToSlotDto,
  CreateScheduleSlotDto,
  GenerateInstructorReportDto,
  ReviewClinicalLogDto,
  ReviewSkillChecklistItemDto,
  SelectInstructorModulesDto,
  SendInstructorMessageDto,
  UpdateInstructorAvailabilityDto,
  UpdateInstructorOnboardingAgreementDto,
  UpdateInstructorProfileDto,
  UploadInstructorDocumentDto,
} from '../types/instructor-portal.types';
import { InstructorPortalService } from '../services/instructor-portal.service';

@Controller('instructors/:instructorId')
export class InstructorPortalController {
  constructor(private readonly instructorPortalService: InstructorPortalService) {}

  @Get('portal')
  getPortal(@Param('instructorId') instructorId: string) {
    return createApiResponse(
      this.instructorPortalService.getPortal(instructorId),
      'Instructor portal state retrieved successfully.',
    );
  }

  @Get('dashboard')
  getDashboard(@Param('instructorId') instructorId: string) {
    return createApiResponse(
      this.instructorPortalService.getDashboard(instructorId),
      'Instructor dashboard retrieved successfully.',
    );
  }

  @Get('profile')
  getProfile(@Param('instructorId') instructorId: string) {
    return createApiResponse(
      this.instructorPortalService.getProfile(instructorId),
      'Instructor profile retrieved successfully.',
    );
  }

  @Patch('profile')
  updateProfile(@Param('instructorId') instructorId: string, @Body() body: UpdateInstructorProfileDto) {
    return createApiResponse(
      this.instructorPortalService.updateProfile(instructorId, body),
      'Instructor profile updated successfully.',
    );
  }

  @Get('onboarding')
  getOnboarding(@Param('instructorId') instructorId: string) {
    return createApiResponse(
      this.instructorPortalService.getOnboarding(instructorId),
      'Instructor onboarding state retrieved successfully.',
    );
  }

  @Patch('onboarding/questions/:questionId')
  answerOnboardingQuestion(
    @Param('instructorId') instructorId: string,
    @Param('questionId') questionId: string,
    @Body() body: AnswerInstructorOnboardingQuestionDto,
  ) {
    return createApiResponse(
      this.instructorPortalService.answerOnboardingQuestion(instructorId, questionId, body),
      'Onboarding question updated successfully.',
    );
  }

  @Patch('onboarding/agreement')
  updateOnboardingAgreement(
    @Param('instructorId') instructorId: string,
    @Body() body: UpdateInstructorOnboardingAgreementDto,
  ) {
    return createApiResponse(
      this.instructorPortalService.updateOnboardingAgreement(instructorId, body),
      'Onboarding agreement updated successfully.',
    );
  }

  @Patch('onboarding/modules')
  selectOnboardingModules(@Param('instructorId') instructorId: string, @Body() body: SelectInstructorModulesDto) {
    return createApiResponse(
      this.instructorPortalService.selectOnboardingModules(instructorId, body),
      'Onboarding module selection updated successfully.',
    );
  }

  @Post('onboarding/documents/:documentId/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          fs.mkdirSync(INSTRUCTOR_READINESS_DOCUMENTS_UPLOADS_DIR, { recursive: true });
          callback(null, INSTRUCTOR_READINESS_DOCUMENTS_UPLOADS_DIR);
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
      limits: { fileSize: 15 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
          callback(null, true);
        } else {
          callback(new BadRequestException('Only image or PDF files can be uploaded.'), false);
        }
      },
    }),
  )
  uploadOnboardingDocument(
    @Param('instructorId') instructorId: string,
    @Param('documentId') documentId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() request: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file received. Attach a file under the "file" field.');
    }

    const baseUrl = `${request.protocol}://${request.get('host')}`;
    const url = `${baseUrl}${UPLOADS_URL_PREFIX}/instructor-readiness-documents/${file.filename}`;

    return createApiResponse(
      this.instructorPortalService.uploadOnboardingDocument(instructorId, documentId, {
        fileName: file.originalname,
        url,
      }),
      'Document uploaded successfully.',
    );
  }

  @Post('onboarding/submit')
  submitOnboarding(@Param('instructorId') instructorId: string) {
    return createApiResponse(
      this.instructorPortalService.submitOnboarding(instructorId),
      'Onboarding submitted successfully.',
    );
  }

  @Get('students')
  getStudents(@Param('instructorId') instructorId: string) {
    return createApiResponse(
      this.instructorPortalService.getStudents(instructorId),
      'Instructor students retrieved successfully.',
    );
  }

  @Get('students/:studentId')
  getStudentRecord(@Param('instructorId') instructorId: string, @Param('studentId') studentId: string) {
    return createApiResponse(
      this.instructorPortalService.getStudentRecord(instructorId, studentId),
      'Instructor student record retrieved successfully.',
    );
  }

  @Patch('students/:studentId/select')
  setActiveStudent(@Param('instructorId') instructorId: string, @Param('studentId') studentId: string) {
    return createApiResponse(
      this.instructorPortalService.setActiveStudent(instructorId, studentId),
      'Instructor active student updated successfully.',
    );
  }

  @Post('students/:studentId/notes')
  addStudentNote(
    @Param('instructorId') instructorId: string,
    @Param('studentId') studentId: string,
    @Body() body: AddInstructorStudentNoteDto,
  ) {
    return createApiResponse(
      this.instructorPortalService.addStudentNote(instructorId, studentId, body),
      'Instructor student note added successfully.',
    );
  }

  @Get('inbox')
  getInbox(@Param('instructorId') instructorId: string) {
    return createApiResponse(
      this.instructorPortalService.getInbox(instructorId),
      'Instructor inbox retrieved successfully.',
    );
  }

  @Patch('inbox/:conversationId/select')
  selectConversation(
    @Param('instructorId') instructorId: string,
    @Param('conversationId') conversationId: string,
  ) {
    return createApiResponse(
      this.instructorPortalService.selectConversation(instructorId, conversationId),
      'Instructor conversation selected successfully.',
    );
  }

  @Post('inbox/messages')
  sendMessage(@Param('instructorId') instructorId: string, @Body() body: SendInstructorMessageDto) {
    return createApiResponse(
      this.instructorPortalService.sendMessage(instructorId, body),
      'Instructor message sent successfully.',
    );
  }

  @Get('clinical-scheduling')
  getSchedule(@Param('instructorId') instructorId: string) {
    return createApiResponse(
      this.instructorPortalService.getSchedule(instructorId),
      'Instructor schedule retrieved successfully.',
    );
  }

  @Post('clinical-scheduling/slots')
  createScheduleSlot(@Param('instructorId') instructorId: string, @Body() body: CreateScheduleSlotDto) {
    return createApiResponse(
      this.instructorPortalService.createScheduleSlot(instructorId, body),
      'Instructor schedule slot created successfully.',
    );
  }

  @Post('clinical-scheduling/slots/:slotId/students')
  assignStudentToSlot(
    @Param('instructorId') instructorId: string,
    @Param('slotId') slotId: string,
    @Body() body: AssignStudentToSlotDto,
  ) {
    return createApiResponse(
      this.instructorPortalService.assignStudentToSlot(instructorId, slotId, body),
      'Student assigned to schedule slot successfully.',
    );
  }

  @Patch('clinical-scheduling/slots/:slotId/students/:studentId/remove')
  removeStudentFromSlot(
    @Param('instructorId') instructorId: string,
    @Param('slotId') slotId: string,
    @Param('studentId') studentId: string,
  ) {
    return createApiResponse(
      this.instructorPortalService.removeStudentFromSlot(instructorId, slotId, studentId),
      'Student removed from schedule slot successfully.',
    );
  }

  @Get('skills')
  getSkillsWorkspace(@Param('instructorId') instructorId: string) {
    return createApiResponse(
      this.instructorPortalService.getSkillsWorkspace(instructorId),
      'Instructor skills workspace retrieved successfully.',
    );
  }

  @Patch('skills/items/:itemId')
  reviewSkillItem(
    @Param('instructorId') instructorId: string,
    @Param('itemId') itemId: string,
    @Body() body: ReviewSkillChecklistItemDto,
  ) {
    return createApiResponse(
      this.instructorPortalService.reviewSkillItem(instructorId, itemId, body),
      'Instructor skill checklist item reviewed successfully.',
    );
  }

  @Get('clinical-logs')
  getClinicalLogs(@Param('instructorId') instructorId: string) {
    return createApiResponse(
      this.instructorPortalService.getClinicalLogs(instructorId),
      'Instructor clinical logs retrieved successfully.',
    );
  }

  @Patch('clinical-logs/:logId')
  reviewClinicalLog(
    @Param('instructorId') instructorId: string,
    @Param('logId') logId: string,
    @Body() body: ReviewClinicalLogDto,
  ) {
    return createApiResponse(
      this.instructorPortalService.reviewClinicalLog(instructorId, logId, body),
      'Instructor clinical log reviewed successfully.',
    );
  }

  @Get('availability')
  getAvailability(@Param('instructorId') instructorId: string) {
    return createApiResponse(
      this.instructorPortalService.getAvailability(instructorId),
      'Instructor availability retrieved successfully.',
    );
  }

  @Patch('availability')
  updateAvailability(
    @Param('instructorId') instructorId: string,
    @Body() body: UpdateInstructorAvailabilityDto,
  ) {
    return createApiResponse(
      this.instructorPortalService.updateAvailability(instructorId, body),
      'Instructor availability updated successfully.',
    );
  }

  @Get('documents')
  getDocuments(@Param('instructorId') instructorId: string) {
    return createApiResponse(
      this.instructorPortalService.getDocuments(instructorId),
      'Instructor documents retrieved successfully.',
    );
  }

  @Post('documents')
  uploadDocument(@Param('instructorId') instructorId: string, @Body() body: UploadInstructorDocumentDto) {
    return createApiResponse(
      this.instructorPortalService.uploadDocument(instructorId, body),
      'Instructor document uploaded successfully.',
    );
  }

  @Get('reports')
  getReports(@Param('instructorId') instructorId: string) {
    return createApiResponse(
      this.instructorPortalService.getReports(instructorId),
      'Instructor reports retrieved successfully.',
    );
  }

  @Post('reports/exports')
  generateReportExport(
    @Param('instructorId') instructorId: string,
    @Body() body: GenerateInstructorReportDto,
  ) {
    return createApiResponse(
      this.instructorPortalService.generateReportExport(instructorId, body),
      'Instructor report export generated successfully.',
    );
  }
}
