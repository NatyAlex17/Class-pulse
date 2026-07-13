import { BadRequestException, Injectable } from '@nestjs/common';
import { AuditLogService } from '../../../common/services/audit-log.service';
import { LocalUsersService } from '../../auth/services/local-users.service';
import { SupabaseService } from '../../auth/services/supabase.service';
import { AuditorPortalService } from '../../auditor/services/auditor-portal.service';
import type { InstructorPortalState } from '../../instructor/types/instructor-portal.types';
import { InstructorIntakeSubmissionService } from '../../instructor/services/instructor-intake-submission.service';
import { InstructorPortalService } from '../../instructor/services/instructor-portal.service';
import { IntakeSubmissionService } from '../../student/services/intake-submission.service';
import { StudentPortalService } from '../../student/services/student-portal.service';
import type { StudentPortalState, StudentIntakeSubmission } from '../../student/types/student-portal.types';

import type {
  AddAdminApplicationNoteDto,
  AdminAuditorAccount,
  AdminApplicationDetail,
  AdminAuditEvent,
  AdminCohortRecord,
  AdminEscalationItem,
  AdminIncompleteOnboardingReport,
  AdminIncompleteOnboardingUser,
  AdminOperationsBreakdownSlice,
  AdminOperationsHighlight,
  AdminOperationsModuleRow,
  AdminOperationsQueueRow,
  AdminOperationsTrendPoint,
  AdminPortalState,
  AdminReportDefinition,
  AdminReportModulePoint,
  AdminReportNarrative,
  AdminReportRange,
  AdminReportStatusSlice,
  AdminReportTrendPoint,
  CreateAuditorAccountDto,
  GenerateAdminReportExportDto,
  UpdateAdminApplicationStatusDto,
  UploadAdminDocumentDto,
} from '../types/admin-portal.types';
import { AdminPortalRepository } from './admin-portal.repository';

@Injectable()
export class AdminPortalService {
  constructor(
    private readonly repository: AdminPortalRepository,
    private readonly intakeSubmissionService: IntakeSubmissionService,
    private readonly studentPortalService: StudentPortalService,
    private readonly instructorPortalService: InstructorPortalService,
    private readonly instructorIntakeSubmissionService: InstructorIntakeSubmissionService,
    private readonly supabaseService: SupabaseService,
    private readonly localUsersService: LocalUsersService,
    private readonly auditorPortalService: AuditorPortalService,
    private readonly auditLogService: AuditLogService,
  ) {}

  getPortal(adminId: string) {
    return this.repository.findByAdminId(adminId);
  }

  getProfile(adminId: string) {
    return this.repository.findByAdminId(adminId).profile;
  }

  getDashboard(adminId: string) {
    return this.repository.findByAdminId(adminId).dashboard;
  }

  getOperations(adminId: string) {
    const portal = this.repository.findByAdminId(adminId);
    const studentSubmissions = this.intakeSubmissionService.getAllSubmissions();
    const instructorSubmissions = this.instructorIntakeSubmissionService.getAllSubmissions();
    const studentPortals = this.studentPortalService.findAllStudentPortals();
    const instructorPortals = this.instructorPortalService.findAllInstructorPortals();
    const escalations = this.buildEscalations(studentSubmissions, instructorSubmissions, instructorPortals);
    const pendingStudentSubmissions = studentSubmissions.filter((submission) => submission.status === 'pending');
    const pendingInstructorSubmissions = instructorSubmissions.filter((submission) => submission.status === 'pending');
    const activeStudents = studentPortals.filter((student) => student.workflowStage === 'active').length;
    const activeInstructors = instructorPortals.filter((instructor) => instructor.workflowStage === 'active').length;
    const distinctCohorts = new Set(
      studentPortals
        .map((student) => student.profile.cohort?.trim())
        .filter((cohort): cohort is string => Boolean(cohort)),
    ).size;

    return {
      generatedAt: new Date().toISOString(),
      metrics: [
        {
          label: 'Student intake queue',
          value: `${pendingStudentSubmissions.length}`,
          tone: pendingStudentSubmissions.length > 0 ? 'warning' : 'success',
        },
        {
          label: 'Instructor onboarding queue',
          value: `${pendingInstructorSubmissions.length}`,
          tone: pendingInstructorSubmissions.length > 0 ? 'warning' : 'success',
        },
        {
          label: 'Active cohorts',
          value: `${distinctCohorts}`,
          tone: distinctCohorts > 0 ? 'primary' : 'info',
        },
        {
          label: 'Compliance blockers',
          value: `${escalations.length}`,
          tone: escalations.some((item) => item.tone === 'error') ? 'error' : escalations.length > 0 ? 'warning' : 'success',
        },
      ],
      trend: this.buildTrend(studentSubmissions, instructorSubmissions, studentPortals),
      workload: this.buildWorkload(studentSubmissions, instructorSubmissions, activeStudents, activeInstructors),
      modules: this.buildModules(studentPortals),
      cohorts: this.buildCohorts(studentPortals, pendingStudentSubmissions, instructorPortals),
      escalations,
      queue: this.buildQueue(studentSubmissions, instructorSubmissions, studentPortals, instructorPortals),
      highlights: this.buildHighlights(
        portal,
        pendingStudentSubmissions.length,
        pendingInstructorSubmissions.length,
        activeStudents,
        escalations.length,
      ),
      financials: portal.financials,
      curriculum: portal.curriculum,
      settings: portal.settings,
    };
  }

  getApplications(adminId: string) {
    const portal = this.repository.findByAdminId(adminId);
    return {
      activeApplicationId: portal.activeApplicationId,
      applications: portal.applications,
    };
  }

  getApplication(adminId: string, applicationId: string) {
    return this.getApplicationOrThrow(this.repository.findByAdminId(adminId), applicationId);
  }

  setActiveApplication(adminId: string, applicationId: string) {
    const portal = this.repository.findByAdminId(adminId);
    this.getApplicationOrThrow(portal, applicationId);
    portal.activeApplicationId = applicationId;
    return this.repository.save(portal).activeApplicationId;
  }

  updateApplicationStatus(adminId: string, applicationId: string, payload: UpdateAdminApplicationStatusDto) {
    const portal = this.repository.findByAdminId(adminId);
    const application = this.getApplicationOrThrow(portal, applicationId);

    application.status = payload.status;
    application.updated = new Date().toISOString();
    if (payload.reason?.trim()) {
      application.notes = [...application.notes, payload.reason.trim()];
    }

    this.recordAudit(portal, 'admin.application.status.updated', applicationId, {
      status: payload.status,
    });
    return this.repository.save(portal).applications.find((item) => item.id === applicationId);
  }

  addApplicationNote(adminId: string, applicationId: string, payload: AddAdminApplicationNoteDto) {
    const note = payload.note.trim();
    if (!note) {
      throw new BadRequestException('Application note cannot be empty.');
    }

    const portal = this.repository.findByAdminId(adminId);
    const application = this.getApplicationOrThrow(portal, applicationId);
    application.notes = [...application.notes, note];
    application.updated = new Date().toISOString();

    this.recordAudit(portal, 'admin.application.note.added', applicationId);
    return this.repository.save(portal).applications.find((item) => item.id === applicationId);
  }

  getReviewQueue(adminId: string) {
    const portal = this.repository.findByAdminId(adminId);
    return {
      activeReviewQueueId: portal.activeReviewQueueId,
      queue: portal.reviewQueue,
    };
  }

  setActiveReviewQueue(adminId: string, queueId: string) {
    const portal = this.repository.findByAdminId(adminId);
    const exists = portal.reviewQueue.some((item) => item.id === queueId);

    if (!exists) {
      throw new BadRequestException(`Review queue item "${queueId}" was not found.`);
    }

    portal.activeReviewQueueId = queueId;
    return this.repository.save(portal).activeReviewQueueId;
  }

  getReports(adminId: string, range: AdminReportRange = '30d') {
    const portal = this.repository.findByAdminId(adminId);
    const studentSubmissions = this.intakeSubmissionService.getAllSubmissions();
    const instructorSubmissions = this.instructorIntakeSubmissionService.getAllSubmissions();
    const studentPortals = this.studentPortalService.findAllStudentPortals();
    const instructorPortals = this.instructorPortalService.findAllInstructorPortals();
    const reports = this.buildReportDefinitions();
    const filteredStudentSubmissions = this.filterByRange(studentSubmissions, range, (item) => item.submittedAt);
    const filteredInstructorSubmissions = this.filterByRange(
      instructorSubmissions,
      range,
      (item) => item.submittedAt,
    );
    const activeStudents = studentPortals.filter((item) => item.workflowStage === 'active').length;
    const activeInstructors = instructorPortals.filter((item) => item.workflowStage === 'active').length;

    return {
      generatedAt: new Date().toISOString(),
      selectedRange: range,
      availableRanges: ['7d', '30d', 'quarter'] satisfies AdminReportRange[],
      cards: portal.reports.cards,
      reports,
      summaryMetrics: [
        {
          id: 'applications',
          label: 'Admissions Volume',
          value: `${filteredStudentSubmissions.length + filteredInstructorSubmissions.length}`,
          delta: `+${filteredStudentSubmissions.filter((item) => item.status === 'pending').length}`,
          tone: 'primary',
          note: 'Student intake plus instructor onboarding submissions in range.',
        },
        {
          id: 'approved',
          label: 'Approved',
          value: `${
            filteredStudentSubmissions.filter((item) => item.status === 'approved').length +
            filteredInstructorSubmissions.filter((item) => item.status === 'approved').length
          }`,
          delta: `${this.calculateApprovalRate(filteredStudentSubmissions, filteredInstructorSubmissions)}%`,
          tone: 'success',
          note: 'Combined approval count and approval rate for the selected window.',
        },
        {
          id: 'students',
          label: 'Active Students',
          value: `${activeStudents}`,
          delta: `${studentPortals.length}`,
          tone: 'info',
          note: 'Students currently active compared with all student portal records.',
        },
        {
          id: 'instructors',
          label: 'Active Instructors',
          value: `${activeInstructors}`,
          delta: `${instructorPortals.length}`,
          tone: 'warning',
          note: 'Instructors currently active compared with all instructor portal records.',
        },
      ],
      narratives: this.buildReportNarratives(
        filteredStudentSubmissions,
        filteredInstructorSubmissions,
        studentPortals,
        instructorPortals,
      ),
      enrollmentTrend: this.buildReportTrend(studentSubmissions, instructorSubmissions, studentPortals, instructorPortals, range),
      applicationStatus: this.buildReportStatus(filteredStudentSubmissions, filteredInstructorSubmissions),
      modulePerformance: this.buildReportModules(studentPortals),
      exports: portal.reports.exports,
    };
  }

  generateReportExport(adminId: string, payload: GenerateAdminReportExportDto) {
    const portal = this.repository.findByAdminId(adminId);
    const report = this.buildReportDefinitions().find((item) => item.id === payload.reportId);

    if (!report) {
      throw new BadRequestException(`Report "${payload.reportId}" was not found.`);
    }

    const exportRow = {
      id: `export-${Date.now()}`,
      reportId: report.id,
      report: report.title,
      scope: 'Generated on demand',
      format: payload.format.trim().toUpperCase(),
      cadence: 'On demand',
      updated: new Date().toISOString(),
      status: 'Queued' as const,
      owner: 'Admin Reports',
      range: payload.range ?? '30d',
    };

    portal.reports.exports = [exportRow, ...portal.reports.exports];
    this.recordAudit(portal, 'admin.report.export.generated', exportRow.id, {
      reportId: payload.reportId,
      format: exportRow.format,
    });
    return this.repository.save(portal).reports.exports[0];
  }

  getDocuments(adminId: string) {
    return this.repository.findByAdminId(adminId).documents;
  }

  uploadDocument(adminId: string, payload: UploadAdminDocumentDto) {
    if (!payload.name.trim() || !payload.owner.trim()) {
      throw new BadRequestException('Document name and owner are required.');
    }

    const portal = this.repository.findByAdminId(adminId);
    const document = {
      id: `doc-${Date.now()}`,
      name: payload.name.trim(),
      category: payload.category,
      owner: payload.owner.trim(),
      updated: new Date().toISOString().slice(0, 10),
      status: payload.status ?? 'Pending',
    };

    portal.documents = [document, ...portal.documents];
    this.recordAudit(portal, 'admin.document.uploaded', document.id);
    return this.repository.save(portal).documents[0];
  }

  getCohorts(adminId: string) {
    const portal = this.repository.findByAdminId(adminId);
    return portal.cohorts;
  }

  getCurriculumSummary(adminId: string) {
    return this.repository.findByAdminId(adminId).curriculum;
  }

  getFinancialSummary(adminId: string) {
    return this.repository.findByAdminId(adminId).financials;
  }

  getSettingsSummary(adminId: string) {
    return this.repository.findByAdminId(adminId).settings;
  }

  async getIncompleteOnboarding(): Promise<AdminIncompleteOnboardingReport> {
    const submittedStudentIds = new Set(
      this.intakeSubmissionService.getAllSubmissions().map((submission) => submission.studentId),
    );
    const submittedInstructorIds = new Set(
      this.instructorIntakeSubmissionService.getAllSubmissions().map((submission) => submission.instructorId),
    );

    let registeredAtByUserId = new Map<string, string>();
    try {
      const users = await this.localUsersService.listByRoles(['student', 'instructor']);
      registeredAtByUserId = new Map(users.map((user) => [user.id, user.createdAt]));
    } catch {
      // Registration dates are best-effort; the portal data alone is enough to build the list.
    }

    const students = this.studentPortalService
      .findAllStudentPortals()
      .filter(
        (portal) =>
          !portal.onboarding.submitted &&
          !submittedStudentIds.has(portal.profile.id) &&
          (portal.workflowStage === 'entrance_exam' || portal.workflowStage === 'enrollment_wizard'),
      )
      .map(
        (portal): AdminIncompleteOnboardingUser => ({
          id: portal.profile.id,
          role: 'student',
          fullName: portal.profile.fullName,
          email: portal.profile.email,
          workflowStage: portal.workflowStage,
          registeredAt: registeredAtByUserId.get(portal.profile.id),
        }),
      );

    const instructors = this.instructorPortalService
      .findAllInstructorPortals()
      .filter(
        (portal) =>
          !portal.onboarding.submitted &&
          !submittedInstructorIds.has(portal.profile.id) &&
          portal.workflowStage === 'onboarding',
      )
      .map(
        (portal): AdminIncompleteOnboardingUser => ({
          id: portal.profile.id,
          role: 'instructor',
          fullName: portal.profile.fullName,
          email: portal.profile.email,
          workflowStage: portal.workflowStage,
          registeredAt: registeredAtByUserId.get(portal.profile.id),
        }),
      );

    const byRegisteredAtDesc = (a: AdminIncompleteOnboardingUser, b: AdminIncompleteOnboardingUser) =>
      new Date(b.registeredAt ?? 0).getTime() - new Date(a.registeredAt ?? 0).getTime();

    return {
      students: students.sort(byRegisteredAtDesc),
      instructors: instructors.sort(byRegisteredAtDesc),
      generatedAt: new Date().toISOString(),
    };
  }

  async listAuditors(): Promise<AdminAuditorAccount[]> {
    const auditors = await this.localUsersService.listByRoles(['auditor']);

    return auditors.map((auditor) => {
      const profile = this.auditorPortalService.ensurePortalForLocalUser(auditor).profile;
      return {
        id: auditor.id,
        email: auditor.email,
        role: auditor.role,
        status: auditor.status,
        createdAt: auditor.createdAt,
        updatedAt: auditor.updatedAt,
        fullName: profile.fullName,
        title: profile.title,
      };
    });
  }

  async createAuditorAccount(adminId: string, payload: CreateAuditorAccountDto): Promise<AdminAuditorAccount> {
    const email = payload.email.trim().toLowerCase();
    const password = payload.password.trim();
    const fullName = payload.fullName?.trim();

    if (!email || !email.includes('@')) {
      throw new BadRequestException('A valid auditor email address is required.');
    }

    if (password.length < 8) {
      throw new BadRequestException('Auditor passwords must be at least 8 characters long.');
    }

    const existingLocalUser = await this.localUsersService.findByEmail(email);
    if (existingLocalUser) {
      throw new BadRequestException('A user with that email address already exists.');
    }

    const { data, error } = await this.supabaseService.adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'auditor',
        ...(fullName ? { full_name: fullName } : {}),
      },
    });

    if (error || !data.user) {
      throw new BadRequestException(error?.message ?? 'Unable to create the auditor account.');
    }

    const localUser = await this.localUsersService.syncSupabaseUser(data.user);
    const portal = this.auditorPortalService.ensurePortalForLocalUser(localUser, {
      fullName,
    });

    await this.auditLogService.record({
      actorUserId: adminId,
      actionType: 'admin.auditor.created',
      targetEntityType: 'user',
      targetEntityId: localUser.id,
      afterValue: {
        id: localUser.id,
        email: localUser.email,
        role: localUser.role,
        status: localUser.status,
      },
      context: {
        fullName: portal.profile.fullName,
        provisionedBy: adminId,
      },
    });

    return {
      id: localUser.id,
      email: localUser.email,
      role: localUser.role,
      status: localUser.status,
      createdAt: localUser.createdAt,
      updatedAt: localUser.updatedAt,
      fullName: portal.profile.fullName,
      title: portal.profile.title,
    };
  }

  private getApplicationOrThrow(portal: AdminPortalState, applicationId: string): AdminApplicationDetail {
    const application = portal.applications.find((item) => item.id === applicationId);

    if (!application) {
      throw new BadRequestException(`Application "${applicationId}" was not found.`);
    }

    return application;
  }

  private recordAudit(
    portal: AdminPortalState,
    action: string,
    target: string,
    details?: Record<string, string | number | boolean | undefined>,
  ) {
    const filteredDetails = Object.fromEntries(
      Object.entries(details ?? {}).filter(([, value]) => value !== undefined),
    ) as Record<string, string | number | boolean>;

    const event: AdminAuditEvent = {
      id: `audit-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      actor: portal.profile.id,
      action,
      target,
      occurredAt: new Date().toISOString(),
      details: Object.keys(filteredDetails).length > 0 ? filteredDetails : undefined,
    };

    portal.auditTrail = [event, ...portal.auditTrail];
  }

  private buildTrend(
    studentSubmissions: StudentIntakeSubmission[],
    instructorSubmissions: ReturnType<InstructorIntakeSubmissionService['getAllSubmissions']>,
    studentPortals: StudentPortalState[],
  ): AdminOperationsTrendPoint[] {
    const points: AdminOperationsTrendPoint[] = [];

    for (let index = 5; index >= 0; index -= 1) {
      const cursor = new Date();
      cursor.setUTCDate(cursor.getUTCDate() - index * 7);
      const weekStart = this.startOfUtcDay(cursor);
      const weekEnd = new Date(weekStart);
      weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
      weekEnd.setUTCHours(23, 59, 59, 999);

      points.push({
        label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        studentSubmissions: studentSubmissions.filter((submission) =>
          this.isWithinRange(submission.submittedAt, weekStart, weekEnd),
        ).length,
        instructorSubmissions: instructorSubmissions.filter((submission) =>
          this.isWithinRange(submission.submittedAt, weekStart, weekEnd),
        ).length,
        activeStudents: studentPortals.filter(
          (portal) => portal.workflowStage === 'active' && this.isWithinRange(this.resolveStudentActivityDate(portal), weekStart, weekEnd),
        ).length,
      });
    }

    return points;
  }

  private buildWorkload(
    studentSubmissions: StudentIntakeSubmission[],
    instructorSubmissions: ReturnType<InstructorIntakeSubmissionService['getAllSubmissions']>,
    activeStudents: number,
    activeInstructors: number,
  ): AdminOperationsBreakdownSlice[] {
    return [
      { name: 'Pending student intake', value: studentSubmissions.filter((item) => item.status === 'pending').length },
      { name: 'Approved student intake', value: studentSubmissions.filter((item) => item.status === 'approved').length },
      {
        name: 'Pending instructor onboarding',
        value: instructorSubmissions.filter((item) => item.status === 'pending').length,
      },
      { name: 'Active students', value: activeStudents },
      { name: 'Active instructors', value: activeInstructors },
    ].filter((slice) => slice.value > 0);
  }

  private buildModules(studentPortals: StudentPortalState[]): AdminOperationsModuleRow[] {
    const moduleMap = new Map<
      string,
      {
        title: string;
        learners: number;
        progressTotal: number;
        completed: number;
        inProgress: number;
        blocked: number;
      }
    >();

    studentPortals.forEach((portal) => {
      portal.modules.forEach((module) => {
        const current = moduleMap.get(module.id) ?? {
          title: module.title,
          learners: 0,
          progressTotal: 0,
          completed: 0,
          inProgress: 0,
          blocked: 0,
        };

        current.learners += 1;
        current.progressTotal += module.progressPercent;

        if (module.status === 'Complete') {
          current.completed += 1;
        } else if (module.status === 'In Progress') {
          current.inProgress += 1;
        } else {
          current.blocked += 1;
        }

        moduleMap.set(module.id, current);
      });
    });

    return Array.from(moduleMap.entries())
      .map(([id, value]) => ({
        id,
        title: value.title,
        learners: value.learners,
        avgProgress: value.learners > 0 ? Math.round(value.progressTotal / value.learners) : 0,
        completed: value.completed,
        inProgress: value.inProgress,
        blocked: value.blocked,
      }))
      .sort((left, right) => right.learners - left.learners);
  }

  private buildReportDefinitions(): AdminReportDefinition[] {
    return [
      {
        id: 'operational-overview',
        title: 'Operational Overview',
        description: 'Combined admissions, activation, and status trend reporting for the selected time range.',
        badge: 'Leadership',
        formats: ['JSON', 'CSV', 'PDF'],
      },
      {
        id: 'admissions-queue-audit',
        title: 'Admissions Queue Audit',
        description: 'Student and instructor submission health, approvals, and blockers across the review queue.',
        badge: 'Daily',
        formats: ['CSV', 'JSON'],
      },
      {
        id: 'compliance-exception-digest',
        title: 'Compliance Exception Digest',
        description: 'Module blockers, rejected documents, and readiness gaps needing follow-up.',
        badge: 'Priority',
        formats: ['PDF', 'JSON'],
      },
    ];
  }

  private buildReportNarratives(
    studentSubmissions: StudentIntakeSubmission[],
    instructorSubmissions: ReturnType<InstructorIntakeSubmissionService['getAllSubmissions']>,
    studentPortals: StudentPortalState[],
    instructorPortals: InstructorPortalState[],
  ): AdminReportNarrative[] {
    const pendingStudent = studentSubmissions.filter((item) => item.status === 'pending').length;
    const approvedStudent = studentSubmissions.filter((item) => item.status === 'approved').length;
    const pendingInstructor = instructorSubmissions.filter((item) => item.status === 'pending').length;
    const activeStudents = studentPortals.filter((item) => item.workflowStage === 'active').length;
    const activeInstructors = instructorPortals.filter((item) => item.workflowStage === 'active').length;

    return [
      {
        title: 'Queue Story',
        text:
          pendingStudent > 0
            ? `${pendingStudent} student submission(s) are still in review while ${approvedStudent} have already cleared admissions.`
            : 'The student intake queue is fully cleared for the selected reporting window.',
      },
      {
        title: 'Instructor Story',
        text:
          pendingInstructor > 0
            ? `${pendingInstructor} instructor onboarding submission(s) are still waiting on final review.`
            : 'Instructor onboarding approvals are keeping pace with current volume.',
      },
      {
        title: 'Activation Story',
        text: `${activeStudents} active students and ${activeInstructors} active instructors are currently reflected across live portal records.`,
      },
    ];
  }

  private buildReportTrend(
    studentSubmissions: StudentIntakeSubmission[],
    instructorSubmissions: ReturnType<InstructorIntakeSubmissionService['getAllSubmissions']>,
    studentPortals: StudentPortalState[],
    instructorPortals: InstructorPortalState[],
    range: AdminReportRange,
  ): AdminReportTrendPoint[] {
    const windows = this.buildRangeWindows(range);
    return windows.map(({ label, start, end }) => ({
      label,
      applications:
        studentSubmissions.filter((item) => this.isWithinRange(item.submittedAt, start, end)).length +
        instructorSubmissions.filter((item) => this.isWithinRange(item.submittedAt, start, end)).length,
      approved:
        studentSubmissions.filter((item) => item.status === 'approved' && this.isWithinRange(item.submittedAt, start, end)).length +
        instructorSubmissions.filter((item) => item.status === 'approved' && this.isWithinRange(item.submittedAt, start, end)).length,
      activeStudents: studentPortals.filter(
        (item) => item.workflowStage === 'active' && this.isWithinRange(this.resolveStudentActivityDate(item), start, end),
      ).length,
      activeInstructors: instructorPortals.filter(
        (item) => item.workflowStage === 'active' && this.isWithinRange(item.auditTrail[0]?.occurredAt, start, end),
      ).length,
    }));
  }

  private buildReportStatus(
    studentSubmissions: StudentIntakeSubmission[],
    instructorSubmissions: ReturnType<InstructorIntakeSubmissionService['getAllSubmissions']>,
  ): AdminReportStatusSlice[] {
    return [
      { name: 'Pending Students', value: studentSubmissions.filter((item) => item.status === 'pending').length },
      { name: 'Approved Students', value: studentSubmissions.filter((item) => item.status === 'approved').length },
      { name: 'Rejected Students', value: studentSubmissions.filter((item) => item.status === 'rejected').length },
      { name: 'Pending Instructors', value: instructorSubmissions.filter((item) => item.status === 'pending').length },
      { name: 'Approved Instructors', value: instructorSubmissions.filter((item) => item.status === 'approved').length },
      { name: 'Rejected Instructors', value: instructorSubmissions.filter((item) => item.status === 'rejected').length },
    ].filter((item) => item.value > 0);
  }

  private buildReportModules(studentPortals: StudentPortalState[]): AdminReportModulePoint[] {
    return this.buildModules(studentPortals).map((module) => ({
      moduleId: module.id,
      moduleTitle: module.title,
      learners: module.learners,
      completion: module.learners > 0 ? Math.round((module.completed / module.learners) * 100) : 0,
      inProgress: module.inProgress,
      blocked: module.blocked,
    }));
  }

  private calculateApprovalRate(
    studentSubmissions: StudentIntakeSubmission[],
    instructorSubmissions: ReturnType<InstructorIntakeSubmissionService['getAllSubmissions']>,
  ) {
    const total = studentSubmissions.length + instructorSubmissions.length;
    if (total === 0) {
      return 0;
    }

    const approved =
      studentSubmissions.filter((item) => item.status === 'approved').length +
      instructorSubmissions.filter((item) => item.status === 'approved').length;

    return Math.round((approved / total) * 100);
  }

  private filterByRange<TItem>(
    items: TItem[],
    range: AdminReportRange,
    getDate: (item: TItem) => string | undefined,
  ) {
    const { start, end } = this.getRangeBounds(range);
    return items.filter((item) => this.isWithinRange(getDate(item), start, end));
  }

  private getRangeBounds(range: AdminReportRange) {
    const end = new Date();
    const start = new Date(end);

    if (range === '7d') {
      start.setUTCDate(start.getUTCDate() - 6);
    } else if (range === '30d') {
      start.setUTCDate(start.getUTCDate() - 29);
    } else {
      start.setUTCMonth(start.getUTCMonth() - 2);
      start.setUTCDate(1);
    }

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
    return { start, end };
  }

  private buildRangeWindows(range: AdminReportRange) {
    if (range === '7d') {
      return Array.from({ length: 7 }, (_, index) => {
        const start = new Date();
        start.setUTCDate(start.getUTCDate() - (6 - index));
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setUTCHours(23, 59, 59, 999);
        return {
          label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
          start,
          end,
        };
      });
    }

    if (range === 'quarter') {
      return Array.from({ length: 3 }, (_, index) => {
        const start = new Date();
        start.setUTCMonth(start.getUTCMonth() - (2 - index), 1);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0, 23, 59, 59, 999));
        return {
          label: start.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
          start,
          end,
        };
      });
    }

    return Array.from({ length: 6 }, (_, index) => {
      const start = new Date();
      start.setUTCDate(start.getUTCDate() - (5 - index) * 5);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 4);
      end.setUTCHours(23, 59, 59, 999);
      return {
        label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        start,
        end,
      };
    });
  }

  private buildCohorts(
    studentPortals: StudentPortalState[],
    pendingStudentSubmissions: StudentIntakeSubmission[],
    instructorPortals: InstructorPortalState[],
  ): AdminCohortRecord[] {
    const cohortMap = new Map<
      string,
      {
        size: number;
        pendingAdmissions: number;
        completionTotal: number;
        completionCount: number;
      }
    >();

    studentPortals.forEach((portal) => {
      const cohortName = portal.profile.cohort?.trim() || 'Unassigned cohort';
      const current = cohortMap.get(cohortName) ?? {
        size: 0,
        pendingAdmissions: 0,
        completionTotal: 0,
        completionCount: 0,
      };
      current.size += 1;
      current.completionTotal += this.computeStudentCompletionRate(portal);
      current.completionCount += 1;
      cohortMap.set(cohortName, current);
    });

    pendingStudentSubmissions.forEach((submission) => {
      const portal = studentPortals.find((item) => item.profile.id === submission.studentId);
      const cohortName = portal?.profile.cohort?.trim() || 'Unassigned cohort';
      const current = cohortMap.get(cohortName) ?? {
        size: 0,
        pendingAdmissions: 0,
        completionTotal: 0,
        completionCount: 0,
      };
      current.pendingAdmissions += 1;
      cohortMap.set(cohortName, current);
    });

    const activeInstructorCount = instructorPortals.filter((portal) => portal.workflowStage === 'active').length;

    return Array.from(cohortMap.entries())
      .map(([name, value], index) => {
        const completionRate =
          value.completionCount > 0 ? Math.round(value.completionTotal / value.completionCount) : 0;
        const note =
          value.pendingAdmissions > 0
            ? `${value.pendingAdmissions} pending admissions`
            : completionRate >= 75
              ? 'Audit ready'
              : 'Needs progress recovery';

        return {
          id: `cohort-${index + 1}`,
          name,
          size: value.size,
          note,
          tone: value.pendingAdmissions > 0 || completionRate < 75 ? 'warning' : 'success',
          pendingAdmissions: value.pendingAdmissions,
          activeInstructors: activeInstructorCount,
          completionRate,
        } satisfies AdminCohortRecord;
      })
      .sort((left, right) => right.size - left.size);
  }

  private buildEscalations(
    studentSubmissions: StudentIntakeSubmission[],
    instructorSubmissions: ReturnType<InstructorIntakeSubmissionService['getAllSubmissions']>,
    instructorPortals: InstructorPortalState[],
  ): AdminEscalationItem[] {
    const escalations: AdminEscalationItem[] = [];

    studentSubmissions.forEach((submission) => {
      const rejectedDocuments = submission.documents.filter(
        (document) => document.required && document.reviewStatus === 'rejected',
      ).length;
      const pendingDocuments = submission.documents.filter(
        (document) => document.required && document.reviewStatus === 'pending',
      ).length;

      if (rejectedDocuments > 0) {
        escalations.push({
          id: `student-rejected-${submission.id}`,
          title: `${rejectedDocuments} required intake documents rejected for ${submission.studentId}`,
          group: 'Admissions',
          tone: 'error',
        });
      } else if (submission.status === 'pending' && pendingDocuments > 0) {
        escalations.push({
          id: `student-pending-${submission.id}`,
          title: `${pendingDocuments} required intake documents still pending for ${submission.studentId}`,
          group: 'Admissions',
          tone: 'warning',
        });
      }
    });

    instructorSubmissions.forEach((submission) => {
      const rejectedDocuments = submission.documents.filter(
        (document) => document.required && document.reviewStatus === 'rejected',
      ).length;

      if (rejectedDocuments > 0) {
        escalations.push({
          id: `instructor-rejected-${submission.id}`,
          title: `${rejectedDocuments} onboarding documents rejected for ${submission.instructorId}`,
          group: 'Compliance',
          tone: 'error',
        });
      } else if (submission.status === 'pending') {
        escalations.push({
          id: `instructor-pending-${submission.id}`,
          title: `Instructor onboarding review still pending for ${submission.instructorId}`,
          group: 'Compliance',
          tone: 'warning',
        });
      }
    });

    instructorPortals.forEach((portal) => {
      const expiringCredentials = portal.profile.credentials.filter((credential) => {
        const daysUntilExpiration =
          (new Date(credential.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return credential.status !== 'Active' || daysUntilExpiration <= 14;
      });

      if (expiringCredentials.length > 0) {
        escalations.push({
          id: `credential-${portal.profile.id}`,
          title: `${portal.profile.fullName} has ${expiringCredentials.length} credential item(s) requiring attention`,
          group: 'Compliance',
          tone: expiringCredentials.some((credential) => credential.status === 'Expired') ? 'error' : 'warning',
        });
      }
    });

    return escalations.slice(0, 8);
  }

  private buildQueue(
    studentSubmissions: StudentIntakeSubmission[],
    instructorSubmissions: ReturnType<InstructorIntakeSubmissionService['getAllSubmissions']>,
    studentPortals: StudentPortalState[],
    instructorPortals: InstructorPortalState[],
  ): AdminOperationsQueueRow[] {
    const studentRows = studentSubmissions.map((submission) => {
      const portal = studentPortals.find((item) => item.profile.id === submission.studentId);
      const candidate = portal?.profile.fullName ?? submission.studentId;
      const track = portal?.profile.cohort?.trim() || 'Unassigned cohort';
      const documentsComplete = `${submission.documents.filter((document) => document.reviewStatus === 'approved').length}/${submission.documents.length}`;
      const blockers = this.describeStudentSubmissionBlockers(submission);

      return {
        id: `student-${submission.id}`,
        type: 'Student Intake',
        candidate,
        track,
        submittedAt: submission.submittedAt,
        status: submission.status,
        documentsComplete,
        blockers,
      } satisfies AdminOperationsQueueRow;
    });

    const instructorRows = instructorSubmissions.map((submission) => {
      const portal = instructorPortals.find((item) => item.profile.id === submission.instructorId);
      const candidate = portal?.profile.fullName ?? submission.instructorId;
      const track = submission.selectedModuleIds.length > 0 ? `${submission.selectedModuleIds.length} selected modules` : 'Modules not selected';
      const documentsComplete = `${submission.documents.filter((document) => document.reviewStatus === 'approved').length}/${submission.documents.length}`;
      const blockers = this.describeInstructorSubmissionBlockers(submission);

      return {
        id: `instructor-${submission.id}`,
        type: 'Instructor Onboarding',
        candidate,
        track,
        submittedAt: submission.submittedAt,
        status: submission.status,
        documentsComplete,
        blockers,
      } satisfies AdminOperationsQueueRow;
    });

    return [...studentRows, ...instructorRows]
      .sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime())
      .slice(0, 12);
  }

  private buildHighlights(
    portal: AdminPortalState,
    pendingStudents: number,
    pendingInstructors: number,
    activeStudents: number,
    escalationCount: number,
  ): AdminOperationsHighlight[] {
    return [
      {
        id: 'queue-health',
        title: 'Admissions queue health',
        detail:
          pendingStudents > 0
            ? `${pendingStudents} student intake submission(s) still need review.`
            : 'No student intake submissions are waiting for review right now.',
        tone: pendingStudents > 0 ? 'warning' : 'success',
      },
      {
        id: 'instructor-pipeline',
        title: 'Instructor onboarding coverage',
        detail:
          pendingInstructors > 0
            ? `${pendingInstructors} instructor onboarding packet(s) are pending.`
            : 'Instructor onboarding queue is fully cleared.',
        tone: pendingInstructors > 0 ? 'warning' : 'success',
      },
      {
        id: 'learner-activation',
        title: 'Learner activation',
        detail: `${activeStudents} student portal record(s) are already active across the current environment.`,
        tone: activeStudents > 0 ? 'primary' : 'info',
      },
      {
        id: 'ops-suite',
        title: 'Export suite readiness',
        detail: `${portal.reports.exports.filter((report) => report.status === 'Ready').length} export bundle(s) are ready to distribute.`,
        tone: escalationCount > 0 ? 'primary' : 'success',
      },
    ];
  }

  private computeStudentCompletionRate(portal: StudentPortalState) {
    if (portal.modules.length === 0) {
      return 0;
    }

    const total = portal.modules.reduce((sum, module) => sum + module.progressPercent, 0);
    return Math.round(total / portal.modules.length);
  }

  private resolveStudentActivityDate(portal: StudentPortalState) {
    return portal.auditTrail[0]?.occurredAt ?? portal.clinicalLogs[0]?.date ?? new Date().toISOString();
  }

  private isWithinRange(value: string | undefined, start: Date, end: Date) {
    if (!value) {
      return false;
    }

    const time = new Date(value).getTime();
    return time >= start.getTime() && time <= end.getTime();
  }

  private startOfUtcDay(value: Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  private describeStudentSubmissionBlockers(submission: StudentIntakeSubmission) {
    const rejectedDocs = submission.documents.filter((document) => document.reviewStatus === 'rejected').length;
    const pendingDocs = submission.documents.filter(
      (document) => document.required && document.reviewStatus === 'pending',
    ).length;
    const pendingQuestions = submission.questions.filter((question) => question.reviewStatus === 'pending').length;

    if (rejectedDocs > 0) {
      return `${rejectedDocs} rejected document(s)`;
    }

    if (pendingDocs > 0) {
      return `${pendingDocs} required document(s) awaiting review`;
    }

    if (pendingQuestions > 0) {
      return `${pendingQuestions} exam question(s) awaiting grading`;
    }

    return submission.rejectionReason?.trim() || 'Clear to process';
  }

  private describeInstructorSubmissionBlockers(
    submission: ReturnType<InstructorIntakeSubmissionService['getAllSubmissions']>[number],
  ) {
    const rejectedDocs = submission.documents.filter((document) => document.reviewStatus === 'rejected').length;
    const pendingDocs = submission.documents.filter(
      (document) => document.required && document.reviewStatus === 'pending',
    ).length;

    if (rejectedDocs > 0) {
      return `${rejectedDocs} rejected document(s)`;
    }

    if (pendingDocs > 0) {
      return `${pendingDocs} required document(s) awaiting review`;
    }

    if (!submission.agreedToTerms) {
      return 'Terms still not accepted';
    }

    if (submission.selectedModuleIds.length === 0) {
      return 'No teaching modules selected';
    }

    return submission.rejectionReason?.trim() || 'Clear to activate';
  }
}
