import { Body, Controller, Get, Param, Patch, Post, Res } from '@nestjs/common';
import type { Response } from 'express';

import { createApiResponse } from '../../../common/utils/create-api-response';
import { sendPdfResponse } from '../../../common/utils/send-pdf-response';
import { CdphE276ConfigService } from '../../admin/services/cdph-e276-config.service';
import { CdphPdfService } from '../../cdph-pdf/services/cdph-pdf.service';
import { LearningResourcesConfigService } from '../../student/services/learning-resources-config.service';
import { StudentPortalService } from '../../student/services/student-portal.service';
import type {
  AddAuditorStudentNoteDto,
  GenerateAuditorReportExportDto,
  ResolveAuditorClinicalItemDto,
  ReviewAuditorInstructorDto,
  UpdateAuditorDocumentStatusDto,
  UpdateAuditorProfileDto,
  UpdateAuditorSettingDto,
  UploadAuditorDocumentDto,
  VerifyAuditorStudentRecordDto,
} from '../types/auditor-portal.types';
import { AuditorPortalService } from '../services/auditor-portal.service';

@Controller('auditors/:auditorId')
export class AuditorPortalController {
  constructor(
    private readonly auditorPortalService: AuditorPortalService,
    private readonly studentPortalService: StudentPortalService,
    private readonly cdphE276ConfigService: CdphE276ConfigService,
    private readonly cdphPdfService: CdphPdfService,
    private readonly learningResourcesConfigService: LearningResourcesConfigService,
  ) {}

  @Get('portal')
  getPortal(@Param('auditorId') auditorId: string) {
    return createApiResponse(
      this.auditorPortalService.getPortal(auditorId),
      'Auditor portal state retrieved successfully.',
    );
  }

  @Get('dashboard')
  getDashboard(@Param('auditorId') auditorId: string) {
    return createApiResponse(
      this.auditorPortalService.getDashboard(auditorId),
      'Auditor dashboard retrieved successfully.',
    );
  }

  @Get('profile')
  getProfile(@Param('auditorId') auditorId: string) {
    return createApiResponse(
      this.auditorPortalService.getProfile(auditorId),
      'Auditor profile retrieved successfully.',
    );
  }

  @Get('students/:studentId/cdph/283b/pdf')
  generateCdph283BPdf(@Param('studentId') studentId: string, @Res() res: Response) {
    const buffer = this.studentPortalService.generateCdph283BPdf(studentId);
    sendPdfResponse(res, buffer, `cdph-283b-${studentId}.pdf`);
  }

  @Get('students/:studentId/cdph/e276c/pdf')
  generateCdphE276CPdf(@Param('studentId') studentId: string, @Res() res: Response) {
    const buffer = this.studentPortalService.generateCdphE276CPdf(studentId, '');
    sendPdfResponse(res, buffer, `cdph-e276c-${studentId}.pdf`);
  }

  @Get('students/:studentId/cdph/e276a/pdf')
  generateCdphE276APdf(@Param('studentId') studentId: string, @Res() res: Response) {
    const buffer = this.studentPortalService.generateCdphE276APdf(studentId, '');
    sendPdfResponse(res, buffer, `cdph-e276a-${studentId}.pdf`);
  }

  @Get('cdph/e276/pdf')
  generateCdphE276Pdf(@Res() res: Response) {
    const profile = this.cdphE276ConfigService.getProfile();
    const modules = this.learningResourcesConfigService.getConfig().modules;

    const buffer = this.cdphPdfService.generateE276({
      ...profile,
      modules: modules
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((module) => ({
          title: module.title,
          theoryHours: module.requiredHours,
          clinicalHours: module.minimumClinicalHours ?? 0,
        })),
    });

    sendPdfResponse(res, buffer, 'cdph-e276.pdf');
  }

  @Patch('profile')
  updateProfile(@Param('auditorId') auditorId: string, @Body() body: UpdateAuditorProfileDto) {
    return createApiResponse(
      this.auditorPortalService.updateProfile(auditorId, body),
      'Auditor profile updated successfully.',
    );
  }

  @Get('student-records')
  getStudentRecords(@Param('auditorId') auditorId: string) {
    return createApiResponse(
      this.auditorPortalService.getStudentRecords(auditorId),
      'Auditor student records retrieved successfully.',
    );
  }

  @Get('student-records/:studentId')
  getStudentRecord(@Param('auditorId') auditorId: string, @Param('studentId') studentId: string) {
    return createApiResponse(
      this.auditorPortalService.getStudentRecord(auditorId, studentId),
      'Auditor student record retrieved successfully.',
    );
  }

  @Patch('student-records/:studentId/select')
  setActiveStudent(@Param('auditorId') auditorId: string, @Param('studentId') studentId: string) {
    return createApiResponse(
      this.auditorPortalService.setActiveStudent(auditorId, studentId),
      'Active auditor student record updated successfully.',
    );
  }

  @Post('student-records/:studentId/notes')
  addStudentNote(
    @Param('auditorId') auditorId: string,
    @Param('studentId') studentId: string,
    @Body() body: AddAuditorStudentNoteDto,
  ) {
    return createApiResponse(
      this.auditorPortalService.addStudentNote(auditorId, studentId, body),
      'Auditor student note added successfully.',
    );
  }

  @Patch('student-records/:studentId/verify')
  verifyStudentRecord(
    @Param('auditorId') auditorId: string,
    @Param('studentId') studentId: string,
    @Body() body: VerifyAuditorStudentRecordDto,
  ) {
    return createApiResponse(
      this.auditorPortalService.verifyStudentRecord(auditorId, studentId, body),
      'Auditor student record verified successfully.',
    );
  }

  @Get('instructor-qualifications')
  getInstructorQualifications(@Param('auditorId') auditorId: string) {
    return createApiResponse(
      this.auditorPortalService.getInstructorQualifications(auditorId),
      'Auditor instructor qualifications retrieved successfully.',
    );
  }

  @Get('instructor-qualifications/:instructorId')
  getInstructorQualification(@Param('auditorId') auditorId: string, @Param('instructorId') instructorId: string) {
    return createApiResponse(
      this.auditorPortalService.getInstructorQualification(auditorId, instructorId),
      'Auditor instructor qualification retrieved successfully.',
    );
  }

  @Patch('instructor-qualifications/:instructorId/select')
  setActiveInstructor(@Param('auditorId') auditorId: string, @Param('instructorId') instructorId: string) {
    return createApiResponse(
      this.auditorPortalService.setActiveInstructor(auditorId, instructorId),
      'Active auditor instructor qualification updated successfully.',
    );
  }

  @Patch('instructor-qualifications/:instructorId/review')
  reviewInstructorQualification(
    @Param('auditorId') auditorId: string,
    @Param('instructorId') instructorId: string,
    @Body() body: ReviewAuditorInstructorDto,
  ) {
    return createApiResponse(
      this.auditorPortalService.reviewInstructorQualification(auditorId, instructorId, body),
      'Auditor instructor qualification reviewed successfully.',
    );
  }

  @Get('clinical-compliance')
  getClinicalCompliance(@Param('auditorId') auditorId: string) {
    return createApiResponse(
      this.auditorPortalService.getClinicalCompliance(auditorId),
      'Auditor clinical compliance retrieved successfully.',
    );
  }

  @Patch('clinical-compliance/:itemId')
  resolveClinicalComplianceItem(
    @Param('auditorId') auditorId: string,
    @Param('itemId') itemId: string,
    @Body() body: ResolveAuditorClinicalItemDto,
  ) {
    return createApiResponse(
      this.auditorPortalService.resolveClinicalComplianceItem(auditorId, itemId, body),
      'Auditor clinical compliance item reviewed successfully.',
    );
  }

  @Get('program-requirements')
  getProgramRequirements(@Param('auditorId') auditorId: string) {
    return createApiResponse(
      this.auditorPortalService.getProgramRequirements(auditorId),
      'Auditor program requirements retrieved successfully.',
    );
  }

  @Patch('program-requirements/:programId/select')
  setActiveProgram(@Param('auditorId') auditorId: string, @Param('programId') programId: string) {
    return createApiResponse(
      this.auditorPortalService.setActiveProgram(auditorId, programId),
      'Active auditor program updated successfully.',
    );
  }

  @Get('documents')
  getDocuments(@Param('auditorId') auditorId: string) {
    return createApiResponse(
      this.auditorPortalService.getDocuments(auditorId),
      'Auditor documents retrieved successfully.',
    );
  }

  @Post('documents')
  uploadDocument(@Param('auditorId') auditorId: string, @Body() body: UploadAuditorDocumentDto) {
    return createApiResponse(
      this.auditorPortalService.uploadDocument(auditorId, body),
      'Auditor document uploaded successfully.',
    );
  }

  @Patch('documents/:documentId/status')
  updateDocumentStatus(
    @Param('auditorId') auditorId: string,
    @Param('documentId') documentId: string,
    @Body() body: UpdateAuditorDocumentStatusDto,
  ) {
    return createApiResponse(
      this.auditorPortalService.updateDocumentStatus(auditorId, documentId, body),
      'Auditor document status updated successfully.',
    );
  }

  @Get('reports')
  getReports(@Param('auditorId') auditorId: string) {
    return createApiResponse(
      this.auditorPortalService.getReports(auditorId),
      'Auditor reports retrieved successfully.',
    );
  }

  @Post('reports/exports')
  generateReportExport(@Param('auditorId') auditorId: string, @Body() body: GenerateAuditorReportExportDto) {
    return createApiResponse(
      this.auditorPortalService.generateReportExport(auditorId, body),
      'Auditor report export generated successfully.',
    );
  }

  @Get('audit-log')
  getAuditLog(@Param('auditorId') auditorId: string) {
    return createApiResponse(
      this.auditorPortalService.getAuditLog(auditorId),
      'Auditor audit log retrieved successfully.',
    );
  }

  @Get('settings')
  getSettings(@Param('auditorId') auditorId: string) {
    return createApiResponse(
      this.auditorPortalService.getSettings(auditorId),
      'Auditor settings retrieved successfully.',
    );
  }

  @Patch('settings')
  updateSetting(@Param('auditorId') auditorId: string, @Body() body: UpdateAuditorSettingDto) {
    return createApiResponse(
      this.auditorPortalService.updateSetting(auditorId, body),
      'Auditor setting updated successfully.',
    );
  }

  @Get('regulator-access')
  getRegulatorAccess(@Param('auditorId') auditorId: string) {
    return createApiResponse(
      this.auditorPortalService.getRegulatorAccess(auditorId),
      'Auditor regulator access snapshot retrieved successfully.',
    );
  }
}
