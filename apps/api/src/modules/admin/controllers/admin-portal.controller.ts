import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { createApiResponse } from '../../../common/utils/create-api-response';
import type {
  AddAdminApplicationNoteDto,
  GenerateAdminReportExportDto,
  UpdateAdminApplicationStatusDto,
  UploadAdminDocumentDto,
} from '../types/admin-portal.types';
import { AdminPortalService } from '../services/admin-portal.service';

@Controller('admins/:adminId')
export class AdminPortalController {
  constructor(private readonly adminPortalService: AdminPortalService) {}

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
}
