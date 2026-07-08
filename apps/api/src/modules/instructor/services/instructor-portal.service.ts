import { BadRequestException, Injectable } from '@nestjs/common';

import type { LocalUserRecord } from '../../auth/types/auth-user.types';
import { DocumentRequirementsConfigService } from '../../student/services/document-requirements-config.service';
import { LearningResourcesConfigService } from '../../student/services/learning-resources-config.service';
import { StudentPortalService } from '../../student/services/student-portal.service';
import type { CurriculumModule, StudentPortalState } from '../../student/types/student-portal.types';
import type {
  AddInstructorStudentNoteDto,
  AnswerInstructorOnboardingQuestionDto,
  AssignStudentToSlotDto,
  CreateScheduleSlotDto,
  GenerateInstructorReportDto,
  InstructorAuditEvent,
  InstructorClinicalLog,
  InstructorCohortSnapshot,
  InstructorDocument,
  InstructorDocumentChecklistItem,
  InstructorIntakeSubmission,
  InstructorModulePerformancePoint,
  InstructorOnboardingState,
  InstructorOperationalHighlight,
  InstructorPortalState,
  InstructorReportDefinition,
  InstructorReportExport,
  InstructorReportNarrative,
  InstructorReportRange,
  InstructorReportSummaryMetric,
  InstructorScheduleSlot,
  InstructorSkillsWorkspace,
  InstructorStudentAttentionRow,
  InstructorTeachingMixSlice,
  InstructorTeachingTrendPoint,
  InstructorStudentRecord,
  ReviewClinicalLogDto,
  ReviewSkillChecklistItemDto,
  SelectInstructorModulesDto,
  SendInstructorMessageDto,
  StartClinicalTimerDto,
  StopClinicalTimerDto,
  StudentRiskLevel,
  UpdateInstructorAvailabilityDto,
  UpdateInstructorOnboardingAgreementDto,
  UpdateInstructorProfileDto,
  UploadInstructorDocumentDto,
} from '../types/instructor-portal.types';
import { InstructorIntakeSubmissionService } from './instructor-intake-submission.service';
import { InstructorPortalRepository } from './instructor-portal.repository';

@Injectable()
export class InstructorPortalService {
  constructor(
    private readonly repository: InstructorPortalRepository,
    private readonly documentRequirementsConfigService: DocumentRequirementsConfigService,
    private readonly learningResourcesConfigService: LearningResourcesConfigService,
    private readonly instructorIntakeSubmissionService: InstructorIntakeSubmissionService,
    private readonly studentPortalService: StudentPortalService,
  ) {}

  ensurePortalForLocalUser(localUser: LocalUserRecord) {
    return this.repository.ensureForLocalUser(localUser);
  }

  getPortal(instructorId: string) {
    return this.syncWorkflowState(this.repository.findByInstructorId(instructorId));
  }

  getDashboard(instructorId: string) {
    return this.repository.findByInstructorId(instructorId).dashboard;
  }

  getProfile(instructorId: string) {
    return this.repository.findByInstructorId(instructorId).profile;
  }

  updateProfile(instructorId: string, payload: UpdateInstructorProfileDto) {
    const portal = this.repository.findByInstructorId(instructorId);

    if (payload.email && !payload.email.includes('@')) {
      throw new BadRequestException('A valid instructor email address is required.');
    }

    portal.profile = {
      ...portal.profile,
      ...this.trimStringFields({ ...payload }),
    };
    this.recordAudit(portal, 'instructor.profile.updated', portal.profile.id, { ...payload });
    return this.repository.save(portal).profile;
  }

  getStudents(instructorId: string) {
    const portal = this.repository.findByInstructorId(instructorId);
    const students = this.buildInstructorStudentRecords(portal);
    return {
      activeStudentId: students.some((student) => student.id === portal.activeStudentId)
        ? portal.activeStudentId
        : (students[0]?.id ?? ''),
      students,
    };
  }

  getStudentRecord(instructorId: string, studentId: string) {
    return this.getStudentOrThrow(this.repository.findByInstructorId(instructorId), studentId);
  }

  setActiveStudent(instructorId: string, studentId: string) {
    const portal = this.repository.findByInstructorId(instructorId);
    this.getStudentOrThrow(portal, studentId);
    portal.activeStudentId = studentId;
    return this.repository.save(portal).activeStudentId;
  }

  addStudentNote(instructorId: string, studentId: string, payload: AddInstructorStudentNoteDto) {
    const cleanNote = payload.note.trim();
    if (!cleanNote) {
      throw new BadRequestException('Review note cannot be empty.');
    }

    const portal = this.repository.findByInstructorId(instructorId);
    this.getStudentOrThrow(portal, studentId);

    const existingNotes = portal.studentNotes?.[studentId] ?? [];
    portal.studentNotes = {
      ...(portal.studentNotes ?? {}),
      [studentId]: [
        {
          date: new Date().toISOString().slice(0, 10),
          note: cleanNote,
          instructor: portal.profile.fullName,
        },
        ...existingNotes,
      ],
    };
    this.recordAudit(portal, 'instructor.student.note.added', studentId);
    const saved = this.repository.save(portal);
    return this.getStudentOrThrow(saved, studentId);
  }

  getInbox(instructorId: string) {
    const portal = this.repository.findByInstructorId(instructorId);
    return {
      activeConversationId: portal.activeConversationId,
      conversations: portal.conversations,
    };
  }

  selectConversation(instructorId: string, conversationId: string) {
    const portal = this.repository.findByInstructorId(instructorId);
    const conversation = portal.conversations.find((item) => item.id === conversationId);

    if (!conversation) {
      throw new BadRequestException(`Conversation "${conversationId}" was not found.`);
    }

    portal.activeConversationId = conversationId;
    return this.repository.save(portal).activeConversationId;
  }

  sendMessage(instructorId: string, payload: SendInstructorMessageDto) {
    const cleanBody = payload.body.trim();
    if (!cleanBody) {
      throw new BadRequestException('Message body cannot be empty.');
    }

    const portal = this.repository.findByInstructorId(instructorId);
    const conversation = portal.conversations.find((item) => item.id === payload.conversationId);

    if (!conversation) {
      throw new BadRequestException(`Conversation "${payload.conversationId}" was not found.`);
    }

    const now = new Date().toISOString();
    conversation.messages = [
      ...conversation.messages,
      {
        id: `msg-${Date.now()}`,
        from: 'instructor',
        body: cleanBody,
        stamp: now,
      },
    ];
    conversation.note = cleanBody;
    conversation.time = now;
    conversation.status = 'Active';
    portal.activeConversationId = conversation.id;

    this.recordAudit(portal, 'instructor.message.sent', conversation.id);
    return this.repository.save(portal).conversations.find((item) => item.id === conversation.id);
  }

  getSchedule(instructorId: string) {
    return this.repository.findByInstructorId(instructorId).schedule;
  }

  createScheduleSlot(instructorId: string, payload: CreateScheduleSlotDto) {
    const portal = this.repository.findByInstructorId(instructorId);
    const duplicate = portal.schedule.find(
      (slot) => slot.weekStart === payload.weekStart && slot.day === payload.day && slot.time === payload.time,
    );

    if (duplicate) {
      throw new BadRequestException('A schedule slot already exists for that week, day, and time.');
    }

    const slot: InstructorScheduleSlot = {
      id: `slot-${Date.now()}`,
      weekStart: payload.weekStart,
      day: payload.day,
      time: payload.time,
      students: [],
      notes: payload.notes?.trim() ?? '',
    };

    portal.schedule = [...portal.schedule, slot];
    this.recordAudit(portal, 'instructor.schedule.slot.created', slot.id);
    return this.repository.save(portal).schedule.find((item) => item.id === slot.id);
  }

  assignStudentToSlot(instructorId: string, slotId: string, payload: AssignStudentToSlotDto) {
    const portal = this.repository.findByInstructorId(instructorId);
    const slot = this.getSlotOrThrow(portal, slotId);
    const student = this.getStudentOrThrow(portal, payload.studentId);

    if (slot.students.some((item) => item.id === payload.studentId)) {
      throw new BadRequestException('That student is already assigned to the selected slot.');
    }

    const conflict = this.findScheduleConflict(payload.studentId, slot);
    if (conflict) {
      throw new BadRequestException(
        `${student.name} is already scheduled with ${conflict.instructorName} at ${slot.time} that day.`,
      );
    }

    slot.students = [
      ...slot.students,
      {
        id: student.id,
        name: student.name,
        cohort: student.cohort,
      },
    ];
    if (payload.notes?.trim()) {
      slot.notes = payload.notes.trim();
    }

    this.recordAudit(portal, 'instructor.schedule.student.assigned', slotId, {
      studentId: payload.studentId,
    });
    return this.repository.save(portal).schedule.find((item) => item.id === slotId);
  }

  removeStudentFromSlot(instructorId: string, slotId: string, studentId: string) {
    const portal = this.repository.findByInstructorId(instructorId);
    const slot = this.getSlotOrThrow(portal, slotId);

    slot.students = slot.students.filter((item) => item.id !== studentId);
    portal.schedule = portal.schedule.filter((item) => item.students.length > 0 || item.id !== slotId);
    this.recordAudit(portal, 'instructor.schedule.student.removed', slotId, { studentId });
    return this.repository.save(portal).schedule;
  }

  getSkillsWorkspace(instructorId: string) {
    const portal = this.repository.findByInstructorId(instructorId);
    const workspaces = this.buildSkillsWorkspaces(portal);
    return {
      activeStudentId: workspaces.some((workspace) => workspace.studentId === portal.activeStudentId)
        ? portal.activeStudentId
        : (workspaces[0]?.studentId ?? ''),
      workspaces,
    };
  }

  reviewSkillItem(
    instructorId: string,
    studentId: string,
    itemId: string,
    payload: ReviewSkillChecklistItemDto,
  ) {
    const portal = this.repository.findByInstructorId(instructorId);
    const taughtStudent = this.getTaughtStudents(portal).find((entry) => entry.student.profile.id === studentId);

    if (!taughtStudent) {
      throw new BadRequestException(`Student "${studentId}" was not found among your assigned students.`);
    }

    const skillExists = taughtStudent.matchingModules
      .filter((module) => module.status === 'Complete')
      .some((module) => (module.skills ?? []).some((skill) => skill.id === itemId));

    if (!skillExists) {
      throw new BadRequestException(`Skill checklist item "${itemId}" was not found.`);
    }

    const studentReviews = portal.skillReviews?.[studentId] ?? {};
    portal.skillReviews = {
      ...(portal.skillReviews ?? {}),
      [studentId]: {
        ...studentReviews,
        [itemId]: {
          status: payload.status,
          feedback: payload.feedback?.trim(),
          reviewedAt: new Date().toISOString(),
        },
      },
    };

    this.recordAudit(portal, 'instructor.skills.item.reviewed', itemId, { studentId, status: payload.status });
    const saved = this.repository.save(portal);
    return this.buildSkillsWorkspaces(saved).find((workspace) => workspace.studentId === studentId);
  }

  /**
   * A skill only appears on a student's checklist once they've finished the module
   * it belongs to; review status/feedback persist in the instructor's skillReviews map.
   */
  private buildSkillsWorkspaces(portal: InstructorPortalState): InstructorSkillsWorkspace[] {
    const reviewsByStudentId = portal.skillReviews ?? {};

    return this.getTaughtStudents(portal)
      .map(({ student, matchingModules }) => {
        const studentReviews = reviewsByStudentId[student.profile.id] ?? {};
        const completedModules = matchingModules.filter((module) => module.status === 'Complete');

        const groups = completedModules
          .filter((module) => (module.skills ?? []).length > 0)
          .map((module) => {
            const items = (module.skills ?? []).map((skill) => {
              const review = studentReviews[skill.id];
              return {
                id: skill.id,
                label: skill.name,
                status: review?.status ?? 'Needs observation',
                feedback: review?.feedback,
              };
            });

            const verifiedCount = items.filter((item) => item.status === 'Verified').length;

            return {
              id: module.id,
              title: module.title,
              progressPercent: items.length > 0 ? Math.round((verifiedCount / items.length) * 100) : 0,
              items,
            };
          });

        if (groups.length === 0) {
          return null;
        }

        const allItems = groups.flatMap((group) => group.items);
        const verifiedTotal = allItems.filter((item) => item.status === 'Verified').length;
        const savedAt = Object.values(studentReviews).reduce<string>(
          (latest, review) => (review.reviewedAt > latest ? review.reviewedAt : latest),
          '',
        );

        const workspace: InstructorSkillsWorkspace = {
          studentId: student.profile.id,
          studentName: student.profile.fullName,
          savedAt,
          completionPercent: allItems.length > 0 ? Math.round((verifiedTotal / allItems.length) * 100) : 0,
          groups,
        };

        return workspace;
      })
      .filter((workspace): workspace is InstructorSkillsWorkspace => workspace !== null);
  }

  getClinicalLogs(instructorId: string): InstructorClinicalLog[] {
    const portal = this.repository.findByInstructorId(instructorId);
    return this.buildInstructorClinicalLogs(portal);
  }

  reviewClinicalLog(instructorId: string, logId: string, payload: ReviewClinicalLogDto) {
    const portal = this.repository.findByInstructorId(instructorId);
    const log = this.buildInstructorClinicalLogs(portal).find((item) => item.id === logId);

    if (!log) {
      throw new BadRequestException(`Clinical log "${logId}" was not found among logs you supervise.`);
    }

    const updated = this.studentPortalService.reviewClinicalLogForInstructor(
      log.studentId,
      logId,
      payload.status,
      payload.note,
    );

    this.recordAudit(portal, 'instructor.clinical-log.reviewed', logId, {
      studentId: log.studentId,
      status: payload.status,
    });
    this.repository.save(portal);

    return {
      ...log,
      status: updated.status,
      note: updated.note,
    } satisfies InstructorClinicalLog;
  }

  /** A clinical log is visible to an instructor when it was logged against a module they teach. */
  private buildInstructorClinicalLogs(portal: InstructorPortalState): InstructorClinicalLog[] {
    return this.getTaughtStudents(portal).flatMap(({ student, matchingModules }) => {
      const matchingModuleIds = new Set(matchingModules.map((module) => module.id));

      return student.clinicalLogs
        .filter((log) => matchingModuleIds.has(log.moduleId))
        .map((log) => ({
          id: log.id,
          studentId: student.profile.id,
          student: student.profile.fullName,
          moduleId: log.moduleId,
          moduleTitle: log.moduleTitle,
          date: log.date,
          hours: log.hours,
          status: log.status,
          note: log.note,
        }));
    });
  }

  getClinicalTimer(instructorId: string) {
    return this.repository.findByInstructorId(instructorId).activeClinicalTimer ?? null;
  }

  startClinicalTimer(instructorId: string, payload: StartClinicalTimerDto) {
    const portal = this.repository.findByInstructorId(instructorId);

    if (portal.activeClinicalTimer) {
      throw new BadRequestException(
        'You already have an active clinical timer running. Stop it before starting another.',
      );
    }

    const taught = this.getTaughtStudents(portal).find(
      (entry) => entry.student.profile.id === payload.studentId,
    );

    if (!taught) {
      throw new BadRequestException(`Student "${payload.studentId}" was not found among your assigned students.`);
    }

    const targetModule = taught.matchingModules.find((module) => module.id === payload.moduleId);

    if (!targetModule) {
      throw new BadRequestException(
        `Module "${payload.moduleId}" is not one of your assigned modules for this student.`,
      );
    }

    const runningElsewhere = this.repository
      .findAll()
      .some(
        (other) =>
          other.profile.id !== instructorId && other.activeClinicalTimer?.studentId === payload.studentId,
      );

    if (runningElsewhere) {
      throw new BadRequestException(
        `${taught.student.profile.fullName} already has an active clinical timer running with another instructor.`,
      );
    }

    portal.activeClinicalTimer = {
      studentId: taught.student.profile.id,
      studentName: taught.student.profile.fullName,
      moduleId: targetModule.id,
      moduleTitle: targetModule.title,
      startedAt: new Date().toISOString(),
    };

    this.recordAudit(portal, 'instructor.clinical-timer.started', payload.studentId, {
      moduleId: payload.moduleId,
    });
    return this.repository.save(portal).activeClinicalTimer;
  }

  stopClinicalTimer(instructorId: string, payload: StopClinicalTimerDto) {
    const portal = this.repository.findByInstructorId(instructorId);
    const timer = portal.activeClinicalTimer;

    if (!timer) {
      throw new BadRequestException('No active clinical timer to stop.');
    }

    const elapsedHours = (Date.now() - new Date(timer.startedAt).getTime()) / (1000 * 60 * 60);
    const roundedHours = Math.round(Math.max(0, elapsedHours) * 100) / 100;

    portal.activeClinicalTimer = undefined;

    if (roundedHours <= 0) {
      this.recordAudit(portal, 'instructor.clinical-timer.discarded', timer.studentId, {
        moduleId: timer.moduleId,
      });
      this.repository.save(portal);
      throw new BadRequestException('Timer duration was too short to log. No clinical hours were recorded.');
    }

    const logEntry = this.studentPortalService.logClinicalHoursFromInstructor(timer.studentId, {
      moduleId: timer.moduleId,
      moduleTitle: timer.moduleTitle,
      hours: roundedHours,
      instructor: portal.profile.fullName,
      note: payload.note,
    });

    this.recordAudit(portal, 'instructor.clinical-timer.stopped', timer.studentId, {
      moduleId: timer.moduleId,
      hours: roundedHours,
    });
    this.repository.save(portal);

    return {
      id: logEntry.id,
      studentId: timer.studentId,
      student: timer.studentName,
      moduleId: timer.moduleId,
      moduleTitle: timer.moduleTitle,
      date: logEntry.date,
      hours: logEntry.hours,
      status: logEntry.status,
      note: logEntry.note,
    } satisfies InstructorClinicalLog;
  }

  getAvailability(instructorId: string) {
    const portal = this.repository.findByInstructorId(instructorId);
    return { ...portal.availability, conflicts: this.computeAvailabilityConflicts(portal) };
  }

  updateAvailability(instructorId: string, payload: UpdateInstructorAvailabilityDto) {
    const portal = this.repository.findByInstructorId(instructorId);
    portal.availability = {
      ...portal.availability,
      ...this.trimStringFields({ ...payload }),
    };
    this.recordAudit(portal, 'instructor.availability.updated', 'availability', { ...payload });
    const saved = this.repository.save(portal);
    return { ...saved.availability, conflicts: this.computeAvailabilityConflicts(saved) };
  }

  private static readonly WEEKDAY_FIELDS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
  private static readonly WEEKDAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  private parseAvailabilityWindow(value: string): { startMinutes: number; endMinutes: number } | null {
    const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
    if (!match) {
      return null;
    }

    const [, startHourStr, startMinuteStr, endHourStr, endMinuteStr] = match;
    const startMinutes = Number(startHourStr) * 60 + Number(startMinuteStr);
    let endMinutes = Number(endHourStr) * 60 + Number(endMinuteStr);

    // Availability is free text (e.g. "08:00 - 04:00" meaning 8am-4pm); if the end time
    // isn't after the start, treat it as a same-day PM end rather than overnight.
    if (endMinutes <= startMinutes) {
      endMinutes += 12 * 60;
    }

    return { startMinutes, endMinutes };
  }

  /**
   * Cross-references the instructor's own clinical schedule slots against their declared
   * weekly availability windows so "Schedule Conflict" reflects real bookings, not copy.
   */
  private computeAvailabilityConflicts(portal: InstructorPortalState): string[] {
    const conflicts: string[] = [];

    InstructorPortalService.WEEKDAY_FIELDS.forEach((field, dayIndex) => {
      const label = InstructorPortalService.WEEKDAY_LABELS[dayIndex];
      const availabilityValue = portal.availability[field]?.trim() ?? '';
      const window = availabilityValue ? this.parseAvailabilityWindow(availabilityValue) : null;
      const bookedSlots = portal.schedule.filter((slot) => slot.day === dayIndex && slot.students.length > 0);

      bookedSlots.forEach((slot) => {
        const [hourStr, minuteStr] = slot.time.split(':');
        const slotMinutes = Number(hourStr) * 60 + Number(minuteStr ?? '0');

        if (!availabilityValue) {
          conflicts.push(
            `${label} ${slot.time} session is booked, but you haven't set your availability for ${label}.`,
          );
          return;
        }

        if (!window || slotMinutes < window.startMinutes || slotMinutes >= window.endMinutes) {
          conflicts.push(
            `${label} ${slot.time} session falls outside your declared availability (${availabilityValue}).`,
          );
        }
      });
    });

    return conflicts;
  }

  getDocuments(instructorId: string) {
    return this.repository.findByInstructorId(instructorId).documents;
  }

  uploadDocument(
    instructorId: string,
    payload: UploadInstructorDocumentDto,
    file: { fileName: string; url: string },
  ) {
    if (!payload.name.trim() || !payload.category.trim()) {
      throw new BadRequestException('Document name and category are required.');
    }

    const portal = this.repository.findByInstructorId(instructorId);
    const document: InstructorDocument = {
      id: `doc-${Date.now()}`,
      name: payload.name.trim(),
      category: payload.category.trim(),
      owner: portal.profile.fullName,
      updated: new Date().toISOString().slice(0, 10),
      status: 'Pending',
      fileName: file.fileName,
      fileUrl: file.url,
    };

    portal.documents = [document, ...portal.documents];
    this.recordAudit(portal, 'instructor.document.uploaded', document.id);
    return this.repository.save(portal).documents[0];
  }

  replaceDocument(instructorId: string, documentId: string, file: { fileName: string; url: string }) {
    const portal = this.repository.findByInstructorId(instructorId);
    const document = portal.documents.find((item) => item.id === documentId);

    if (!document) {
      throw new BadRequestException(`Document "${documentId}" was not found.`);
    }

    document.fileName = file.fileName;
    document.fileUrl = file.url;
    document.updated = new Date().toISOString().slice(0, 10);
    document.status = 'Pending';

    this.recordAudit(portal, 'instructor.document.replaced', documentId);
    return this.repository.save(portal).documents.find((item) => item.id === documentId);
  }

  getReports(instructorId: string, range: InstructorReportRange = '30d') {
    const portal = this.repository.findByInstructorId(instructorId);
    const taughtStudents = this.getTaughtStudents(portal);
    const studentRecords = this.buildInstructorStudentRecords(portal);
    const reportDefinitions = this.getReportDefinitions();
    const exports = this.normalizeReportExports(portal);
    const teachingTrend = this.buildTeachingTrend(taughtStudents, range);
    const modulePerformance = this.buildModulePerformance(taughtStudents);
    const teachingMix = this.buildTeachingMix(taughtStudents, portal);
    const cohortSnapshots = this.buildCohortSnapshots(studentRecords);
    const studentAttention = this.buildStudentAttentionRows(taughtStudents, studentRecords);
    const summaryMetrics = this.buildReportSummaryMetrics(studentRecords, taughtStudents);
    const narratives = this.buildReportNarratives(summaryMetrics, cohortSnapshots, studentAttention);
    const highlights = this.buildOperationalHighlights(modulePerformance, cohortSnapshots, studentAttention);

    return {
      generatedAt: new Date().toISOString(),
      selectedRange: range,
      availableRanges: ['7d', '30d', 'term'],
      reports: reportDefinitions,
      summaryMetrics,
      narratives,
      teachingTrend,
      modulePerformance,
      teachingMix,
      cohortSnapshots,
      studentAttention,
      highlights,
      exports,
    };
  }

  generateReportExport(instructorId: string, payload: GenerateInstructorReportDto) {
    const portal = this.repository.findByInstructorId(instructorId);
    const report = this.getReportDefinitions().find((item) => item.id === payload.reportId);

    if (!report) {
      throw new BadRequestException(`Report "${payload.reportId}" was not found.`);
    }

    const format = payload.format.trim().toUpperCase() as 'CSV' | 'PDF' | 'JSON';
    if (!report.formats.includes(format)) {
      throw new BadRequestException(
        `Format "${format}" is not supported for report "${payload.reportId}".`,
      );
    }

    const exportRow: InstructorReportExport = {
      id: `export-${Date.now()}`,
      reportId: report.id,
      report: report.title,
      format,
      cadence: 'On demand',
      updated: new Date().toISOString(),
      status: 'Queued',
      range: payload.range ?? '30d',
    };

    portal.reports = {
      ...(portal.reports ?? { exports: [] }),
      exports: [exportRow, ...this.normalizeReportExports(portal)],
    } as InstructorPortalState['reports'];

    this.recordAudit(portal, 'instructor.report.export.generated', exportRow.id, {
      reportId: payload.reportId,
      format: exportRow.format,
      range: exportRow.range ?? '30d',
    });
    return this.repository.save(portal).reports.exports[0];
  }

  private getStudentOrThrow(portal: InstructorPortalState, studentId: string): InstructorStudentRecord {
    const student = this.buildInstructorStudentRecords(portal).find((item) => item.id === studentId);

    if (!student) {
      throw new BadRequestException(`Student "${studentId}" was not found.`);
    }

    return student;
  }

  /**
   * A student is "assigned" to this instructor when they're enrolled in a curriculum
   * module the instructor is approved to teach (their onboarding selectedModuleIds,
   * once workflowStage is 'active'). There is no separate assignment table. Shared by
   * every instructor feature that scopes real students to "who I teach" (My Students,
   * Skills Checklists, etc).
   */
  private getTaughtStudents(
    portal: InstructorPortalState,
  ): Array<{ student: StudentPortalState; matchingModules: CurriculumModule[] }> {
    if (portal.workflowStage !== 'active') {
      return [];
    }

    const moduleIds = new Set(portal.onboarding.selectedModuleIds);
    if (moduleIds.size === 0) {
      return [];
    }

    return this.studentPortalService
      .findAllStudentPortals()
      .map((student) => ({
        student,
        matchingModules: student.modules.filter((module) => moduleIds.has(module.id)),
      }))
      .filter((entry) => entry.matchingModules.length > 0);
  }

  private buildInstructorStudentRecords(portal: InstructorPortalState): InstructorStudentRecord[] {
    const notesByStudentId = portal.studentNotes ?? {};

    return this.getTaughtStudents(portal).map(({ student, matchingModules }) => {
        const checklistTotal = matchingModules.reduce((sum, module) => sum + module.steps.length, 0);
        const checklistCompleted = matchingModules.reduce(
          (sum, module) => sum + module.steps.filter((step) => step.complete).length,
          0,
        );
        const clinicalHoursRequired = matchingModules.reduce((sum, module) => sum + module.requiredHours, 0);
        const clinicalHoursCompleted = matchingModules.reduce((sum, module) => sum + module.completedHours, 0);
        const progressPercent = Math.round(
          matchingModules.reduce((sum, module) => sum + module.progressPercent, 0) / matchingModules.length,
        );

        const latestClinicalSession = [...student.clinicalSessions]
          .filter((session) => session.type === 'Clinical')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        const totalAttendance = student.attendanceRecords.length;
        const presentCount = student.attendanceRecords.filter((record) => record.status === 'Present').length;
        const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;
        const absences = student.attendanceRecords.filter(
          (record) => record.status === 'Unplanned Absence',
        ).length;

        const engagementScore = Math.round(
          (checklistTotal > 0 ? checklistCompleted / checklistTotal : 0) * 50 + (attendanceRate / 100) * 50,
        );

        const risk: StudentRiskLevel =
          progressPercent < 60 || attendanceRate < 80
            ? 'Urgent'
            : progressPercent < 85 || absences > 1
              ? 'Watch'
              : 'Stable';

        const primaryModuleStatus = matchingModules[0]?.status ?? 'Locked';
        const certificationStatus =
          primaryModuleStatus === 'Complete'
            ? 'On Track'
            : primaryModuleStatus === 'In Progress'
              ? 'In Progress'
              : 'Not Started';

        const record: InstructorStudentRecord = {
          id: student.profile.id,
          name: student.profile.fullName,
          cohort: student.profile.cohort,
          placement: latestClinicalSession?.location ?? 'Not yet assigned',
          checklistCompleted,
          checklistTotal,
          clinicalHoursCompleted,
          clinicalHoursRequired,
          risk,
          email: student.profile.email,
          phone: student.profile.phone,
          city: student.profile.location,
          startDate: '',
          certificationStatus,
          progressPercent,
          absences,
          attendanceRate,
          engagementScore,
          recentNotes: notesByStudentId[student.profile.id] ?? [],
          skills: [],
          modules: matchingModules.map((module) => ({ id: module.id, title: module.title })),
        };

        return record;
      });
  }

  private getReportDefinitions(): InstructorReportDefinition[] {
    return [
      {
        id: 'teaching-effectiveness-summary',
        title: 'Teaching Effectiveness Summary',
        description: 'Attendance, readiness, and competency progress across all assigned learners.',
        category: 'teaching',
        formats: ['PDF', 'CSV', 'JSON'],
      },
      {
        id: 'student-risk-watchlist',
        title: 'Student Risk Watchlist',
        description: 'Detailed intervention list for students slipping on progress, hours, or attendance.',
        category: 'students',
        formats: ['CSV', 'JSON'],
      },
      {
        id: 'module-performance-breakdown',
        title: 'Module Performance Breakdown',
        description: 'Completion, attendance, and signoff lag across each module this instructor teaches.',
        category: 'teaching',
        formats: ['CSV', 'PDF', 'JSON'],
      },
      {
        id: 'clinical-compliance-audit',
        title: 'Clinical Compliance Audit',
        description: 'Clinical log verification, pending signoffs, and readiness indicators for audit follow-up.',
        category: 'compliance',
        formats: ['PDF', 'CSV', 'JSON'],
      },
      {
        id: 'instruction-load-planner',
        title: 'Instruction Load Planner',
        description: 'Teaching mix, schedule pressure, and learner distribution for operational planning.',
        category: 'operations',
        formats: ['PDF', 'JSON'],
      },
    ];
  }

  private normalizeReportExports(portal: InstructorPortalState): InstructorReportExport[] {
    return (portal.reports?.exports ?? []).map((item) => ({
      ...item,
      reportId: item.reportId,
      range: item.range ?? '30d',
    }));
  }

  private buildReportSummaryMetrics(
    studentRecords: InstructorStudentRecord[],
    taughtStudents: Array<{ student: StudentPortalState; matchingModules: CurriculumModule[] }>,
  ): InstructorReportSummaryMetric[] {
    const assignedStudents = studentRecords.length;
    const averageAttendance = this.average(studentRecords.map((student) => student.attendanceRate));
    const openSignoffs = taughtStudents.reduce(
      (sum, entry) =>
        sum +
        entry.student.clinicalLogs.filter(
          (log) =>
            entry.matchingModules.some((module) => module.id === log.moduleId) && log.status !== 'Verified',
        ).length,
      0,
    );
    const criticalRisks = studentRecords.filter((student) => student.risk === 'Urgent').length;

    return [
      {
        label: 'Students Assigned',
        value: String(assignedStudents),
        tone: 'primary',
        note: 'Learners currently attached to at least one module you teach.',
      },
      {
        label: 'Avg. Attendance',
        value: `${Math.round(averageAttendance)}%`,
        tone: 'success',
        note: 'Average attendance across all assigned student records.',
      },
      {
        label: 'Open Signoffs',
        value: String(openSignoffs),
        tone: openSignoffs > 0 ? 'warning' : 'success',
        note: 'Clinical log entries still pending instructor verification.',
      },
      {
        label: 'Critical Risks',
        value: String(criticalRisks),
        tone: criticalRisks > 0 ? 'error' : 'success',
        note: 'Students with urgent risk indicators requiring immediate follow-up.',
      },
    ];
  }

  private buildReportNarratives(
    summaryMetrics: InstructorReportSummaryMetric[],
    cohortSnapshots: InstructorCohortSnapshot[],
    studentAttention: InstructorStudentAttentionRow[],
  ): InstructorReportNarrative[] {
    const topCohort = [...cohortSnapshots].sort((a, b) => b.readiness - a.readiness)[0];
    const mostAtRisk = [...studentAttention].sort((a, b) => {
      const riskWeight = { Critical: 3, Watch: 2, Stable: 1 };
      return riskWeight[b.risk] - riskWeight[a.risk] || a.progress - b.progress;
    })[0];

    return [
      {
        title: 'Teaching Story',
        text: `You currently oversee ${summaryMetrics[0]?.value ?? '0'} active learners, with overall attendance holding at ${summaryMetrics[1]?.value ?? '0%'}.`,
      },
      {
        title: 'Cohort Story',
        text: topCohort
          ? `${topCohort.cohort} is your strongest cohort right now at ${topCohort.readiness}% readiness and ${topCohort.attendance}% attendance.`
          : 'No cohort readiness data is available yet because no learners are assigned to this instructor.',
      },
      {
        title: 'Intervention Story',
        text: mostAtRisk
          ? `${mostAtRisk.student} in ${mostAtRisk.cohort} needs the closest follow-up, with ${mostAtRisk.hoursRemaining} clinical hours still open and ${mostAtRisk.signoffsOpen} pending signoffs.`
          : 'No intervention watchlist items are active right now.',
      },
    ];
  }

  private buildTeachingTrend(
    taughtStudents: Array<{ student: StudentPortalState; matchingModules: CurriculumModule[] }>,
    range: InstructorReportRange,
  ): InstructorTeachingTrendPoint[] {
    const bucketCount = range === '7d' ? 7 : range === '30d' ? 6 : 8;
    const bucketSizeDays = range === '7d' ? 1 : range === '30d' ? 5 : 14;
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - bucketCount * bucketSizeDays + 1);

    const buckets = Array.from({ length: bucketCount }, (_, index) => {
      const bucketStart = new Date(start);
      bucketStart.setDate(start.getDate() + index * bucketSizeDays);
      const bucketEnd = new Date(bucketStart);
      bucketEnd.setDate(bucketStart.getDate() + bucketSizeDays);

      const label =
        range === '7d'
          ? bucketStart.toLocaleDateString('en-US', { weekday: 'short' })
          : `${bucketStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

      let teachingHours = 0;
      let studentContacts = 0;
      let signoffsCompleted = 0;
      let attendanceTotal = 0;
      let attendancePresent = 0;

      taughtStudents.forEach(({ student, matchingModules }) => {
        const moduleIds = new Set(matchingModules.map((module) => module.id));

        student.clinicalLogs.forEach((log) => {
          const date = new Date(log.date);
          if (moduleIds.has(log.moduleId) && date >= bucketStart && date < bucketEnd) {
            teachingHours += log.hours;
            studentContacts += 1;
            if (log.status === 'Verified') {
              signoffsCompleted += 1;
            }
          }
        });

        student.attendanceRecords.forEach((record) => {
          const date = new Date(record.date);
          if (date >= bucketStart && date < bucketEnd) {
            attendanceTotal += 1;
            if (record.status === 'Present') {
              attendancePresent += 1;
            }
          }
        });
      });

      return {
        label,
        teachingHours: Math.round(teachingHours * 10) / 10,
        studentContacts,
        signoffsCompleted,
        attendanceRate: attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 100,
      };
    });

    return buckets;
  }

  private buildModulePerformance(
    taughtStudents: Array<{ student: StudentPortalState; matchingModules: CurriculumModule[] }>,
  ): InstructorModulePerformancePoint[] {
    const modules = new Map<string, InstructorModulePerformancePoint>();

    taughtStudents.forEach(({ student, matchingModules }) => {
      const studentAttendanceRate = this.calculateAttendanceRate(student);

      matchingModules.forEach((module) => {
        const existing = modules.get(module.id) ?? {
          moduleId: module.id,
          moduleTitle: module.title,
          students: 0,
          completion: 0,
          attendance: 0,
          signoffLag: 0,
        };

        const pendingLogs = student.clinicalLogs.filter(
          (log) => log.moduleId === module.id && log.status !== 'Verified',
        ).length;

        existing.students += 1;
        existing.completion += module.progressPercent;
        existing.attendance += studentAttendanceRate;
        existing.signoffLag += pendingLogs;
        modules.set(module.id, existing);
      });
    });

    return Array.from(modules.values()).map((module) => ({
      ...module,
      completion: module.students > 0 ? Math.round(module.completion / module.students) : 0,
      attendance: module.students > 0 ? Math.round(module.attendance / module.students) : 0,
    }));
  }

  private buildTeachingMix(
    taughtStudents: Array<{ student: StudentPortalState; matchingModules: CurriculumModule[] }>,
    portal: InstructorPortalState,
  ): InstructorTeachingMixSlice[] {
    let theory = 0;
    let skillsLab = 0;
    let clinical = 0;
    let advising = 0;

    taughtStudents.forEach(({ student, matchingModules }) => {
      const moduleIds = new Set(matchingModules.map((module) => module.id));

      student.attendanceRecords.forEach((record) => {
        if (record.type === 'Theory') {
          theory += 1;
        } else {
          clinical += 1;
        }
      });

      student.clinicalLogs.forEach((log) => {
        if (moduleIds.has(log.moduleId)) {
          clinical += log.hours;
        }
      });
    });

    portal.schedule.forEach((slot) => {
      const notes = slot.notes.toLowerCase();
      if (notes.includes('lab') || notes.includes('simulation')) {
        skillsLab += Math.max(slot.students.length, 1);
      } else if (notes.includes('clinical') || notes.includes('rotation')) {
        clinical += Math.max(slot.students.length, 1);
      } else {
        theory += Math.max(slot.students.length, 1);
      }
    });

    advising = Object.values(portal.studentNotes ?? {}).reduce((sum, notes) => sum + notes.length, 0) + portal.conversations.length;

    const total = Math.max(theory + skillsLab + clinical + advising, 1);
    return [
      { name: 'Theory', value: Math.round((theory / total) * 100) },
      { name: 'Skills Lab', value: Math.round((skillsLab / total) * 100) },
      { name: 'Clinical', value: Math.round((clinical / total) * 100) },
      { name: 'Advising', value: Math.round((advising / total) * 100) },
    ];
  }

  private buildCohortSnapshots(studentRecords: InstructorStudentRecord[]): InstructorCohortSnapshot[] {
    const cohorts = new Map<
      string,
      { learners: number; attendance: number; readiness: number; watchCount: number; criticalCount: number }
    >();

    studentRecords.forEach((student) => {
      const existing = cohorts.get(student.cohort) ?? {
        learners: 0,
        attendance: 0,
        readiness: 0,
        watchCount: 0,
        criticalCount: 0,
      };
      existing.learners += 1;
      existing.attendance += student.attendanceRate;
      existing.readiness += student.progressPercent;
      if (student.risk === 'Watch') existing.watchCount += 1;
      if (student.risk === 'Urgent') existing.criticalCount += 1;
      cohorts.set(student.cohort, existing);
    });

    return Array.from(cohorts.entries()).map(([cohort, data]) => ({
      cohort,
      learners: data.learners,
      attendance: Math.round(data.attendance / Math.max(data.learners, 1)),
      readiness: Math.round(data.readiness / Math.max(data.learners, 1)),
      risk: data.criticalCount > 0 ? 'High' : data.watchCount > 0 ? 'Moderate' : 'Low',
    }));
  }

  private buildStudentAttentionRows(
    taughtStudents: Array<{ student: StudentPortalState; matchingModules: CurriculumModule[] }>,
    studentRecords: InstructorStudentRecord[],
  ): InstructorStudentAttentionRow[] {
    const recordsById = new Map(studentRecords.map((record) => [record.id, record]));

    return taughtStudents
      .map(({ student, matchingModules }) => {
        const record = recordsById.get(student.profile.id);
        if (!record) return null;

        const primaryModule =
          [...matchingModules].sort((a, b) => a.progressPercent - b.progressPercent)[0] ?? matchingModules[0];
        const signoffsOpen = student.clinicalLogs.filter(
          (log) => log.moduleId === primaryModule?.id && log.status !== 'Verified',
        ).length;

        const risk: InstructorStudentAttentionRow['risk'] =
          record.risk === 'Urgent' ? 'Critical' : record.risk === 'Watch' ? 'Watch' : 'Stable';

        return {
          studentId: record.id,
          student: record.name,
          cohort: record.cohort,
          module: primaryModule?.title ?? 'No active module',
          progress: record.progressPercent,
          attendance: record.attendanceRate,
          hoursRemaining: Math.max(record.clinicalHoursRequired - record.clinicalHoursCompleted, 0),
          signoffsOpen,
          risk,
          action:
            risk === 'Critical'
              ? 'Schedule intervention meeting'
              : risk === 'Watch'
                ? 'Review recovery plan'
                : 'Continue current pacing',
        };
      })
      .filter((row): row is InstructorStudentAttentionRow => row !== null)
      .sort((a, b) => {
        const riskWeight = { Critical: 3, Watch: 2, Stable: 1 };
        return riskWeight[b.risk] - riskWeight[a.risk] || a.progress - b.progress;
      });
  }

  private buildOperationalHighlights(
    modulePerformance: InstructorModulePerformancePoint[],
    cohortSnapshots: InstructorCohortSnapshot[],
    studentAttention: InstructorStudentAttentionRow[],
  ): InstructorOperationalHighlight[] {
    const bestCohort = [...cohortSnapshots].sort((a, b) => b.readiness - a.readiness)[0];
    const weakestModule = [...modulePerformance].sort((a, b) => b.signoffLag - a.signoffLag)[0];
    const topModule = [...modulePerformance].sort((a, b) => b.completion - a.completion)[0];
    const criticalCount = studentAttention.filter((student) => student.risk === 'Critical').length;

    return [
      {
        title: 'Best-performing cohort',
        detail: bestCohort
          ? `${bestCohort.cohort} / ${bestCohort.attendance}% attendance`
          : 'No cohort data available',
        supportingText: 'Highest combined attendance and readiness across the assigned roster.',
        tone: 'success',
      },
      {
        title: 'Most delayed area',
        detail: weakestModule
          ? `${weakestModule.moduleTitle} / ${weakestModule.signoffLag} lagging signoffs`
          : 'No signoff backlog detected',
        supportingText: 'The area with the greatest verification lag right now.',
        tone: weakestModule?.signoffLag ? 'warning' : 'success',
      },
      {
        title: 'Strongest module',
        detail: topModule
          ? `${topModule.moduleTitle} / ${topModule.completion}% completion`
          : 'No module performance data available',
        supportingText: 'The module currently showing the strongest learner completion signal.',
        tone: 'primary',
      },
      {
        title: 'Immediate next move',
        detail:
          criticalCount > 0
            ? `Close ${criticalCount} critical learner recovery plan${criticalCount === 1 ? '' : 's'}`
            : 'No urgent interventions currently open',
        supportingText: 'Fastest operational action the instructor can take from this report.',
        tone: criticalCount > 0 ? 'error' : 'success',
      },
    ];
  }

  private calculateAttendanceRate(student: StudentPortalState) {
    const total = student.attendanceRecords.length;
    if (total === 0) {
      return 100;
    }

    const present = student.attendanceRecords.filter((record) => record.status === 'Present').length;
    return Math.round((present / total) * 100);
  }

  private average(values: number[]) {
    if (values.length === 0) {
      return 0;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private getSlotOrThrow(portal: InstructorPortalState, slotId: string) {
    const slot = portal.schedule.find((item) => item.id === slotId);

    if (!slot) {
      throw new BadRequestException(`Schedule slot "${slotId}" was not found.`);
    }

    return slot;
  }

  /**
   * A student can only be in one place at a time. Clinical schedules live on each
   * instructor's own portal, so a conflict is only detectable by scanning every
   * instructor's schedule for the same week/day/time slot the student is already in.
   */
  private findScheduleConflict(
    studentId: string,
    targetSlot: InstructorScheduleSlot,
  ): { instructorName: string } | null {
    for (const otherPortal of this.repository.findAll()) {
      const conflictingSlot = otherPortal.schedule.find(
        (slot) =>
          slot.id !== targetSlot.id &&
          slot.weekStart === targetSlot.weekStart &&
          slot.day === targetSlot.day &&
          slot.time === targetSlot.time &&
          slot.students.some((student) => student.id === studentId),
      );

      if (conflictingSlot) {
        return { instructorName: otherPortal.profile.fullName };
      }
    }

    return null;
  }

  getOnboarding(instructorId: string) {
    const portal = this.syncWorkflowState(this.repository.findByInstructorId(instructorId));
    const submission = this.instructorIntakeSubmissionService.getInstructorSubmission(instructorId);
    return {
      ...this.buildOnboardingSnapshot(portal),
      workflowStage: portal.workflowStage,
      rejectionReason: submission?.rejectionReason,
    };
  }

  answerOnboardingQuestion(instructorId: string, questionId: string, payload: AnswerInstructorOnboardingQuestionDto) {
    if (!payload.answer.trim()) {
      throw new BadRequestException('Onboarding answers cannot be empty.');
    }

    const portal = this.assertOnboardingEditable(instructorId);
    const question = portal.onboarding.questions.find((item) => item.id === questionId);

    if (!question) {
      throw new BadRequestException(`Onboarding question "${questionId}" was not found.`);
    }

    question.answer = payload.answer.trim();
    this.recordAudit(portal, 'instructor.onboarding.question.updated', questionId, { questionId });
    return this.buildOnboardingSnapshot(this.repository.save(portal));
  }

  updateOnboardingAgreement(instructorId: string, payload: UpdateInstructorOnboardingAgreementDto) {
    const portal = this.assertOnboardingEditable(instructorId);
    portal.onboarding.agreedToTerms = payload.agreedToTerms;
    this.recordAudit(portal, 'instructor.onboarding.agreement.updated', 'terms', {
      agreedToTerms: payload.agreedToTerms,
    });
    return this.buildOnboardingSnapshot(this.repository.save(portal));
  }

  selectOnboardingModules(instructorId: string, payload: SelectInstructorModulesDto) {
    const portal = this.assertOnboardingEditable(instructorId);
    const validModuleIds = new Set(this.learningResourcesConfigService.getConfig().modules.map((module) => module.id));
    const moduleIds = payload.moduleIds.filter((id) => validModuleIds.has(id));

    portal.onboarding.selectedModuleIds = moduleIds;
    this.recordAudit(portal, 'instructor.onboarding.modules.updated', 'modules', {
      moduleCount: moduleIds.length,
    });
    return this.buildOnboardingSnapshot(this.repository.save(portal));
  }

  uploadOnboardingDocument(instructorId: string, documentId: string, file: { fileName: string; url: string }) {
    const portal = this.assertOnboardingEditable(instructorId);
    const document = this.documentRequirementsConfigService
      .getDocumentsFor('instructor')
      .find((item) => item.id === documentId);

    if (!document) {
      throw new BadRequestException(`Document "${documentId}" was not found.`);
    }

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
    this.recordAudit(portal, 'instructor.onboarding.document.uploaded', documentId, {
      documentId,
      fileName: file.fileName,
    });
    return this.buildOnboardingSnapshot(this.repository.save(portal));
  }

  submitOnboarding(instructorId: string) {
    const portal = this.assertOnboardingEditable(instructorId);
    const requiredDocuments = this.documentRequirementsConfigService
      .getDocumentsFor('instructor')
      .filter((document) => document.required);

    const allQuestionsAnswered = portal.onboarding.questions.every((question) => question.answer.trim().length > 0);
    const readinessComplete = requiredDocuments.every(
      (document) => portal.onboarding.readinessUploads[document.id] === true,
    );
    const hasSelectedModules = portal.onboarding.selectedModuleIds.length > 0;

    if (!allQuestionsAnswered || !readinessComplete || !portal.onboarding.agreedToTerms || !hasSelectedModules) {
      throw new BadRequestException(
        'Onboarding is incomplete. Questions, required documents, the terms agreement, and at least one module selection must all be complete before submission.',
      );
    }

    const documentChecklist = this.buildDocumentChecklist(portal.onboarding);
    const modulesById = new Map(this.learningResourcesConfigService.getConfig().modules.map((module) => [module.id, module]));

    this.instructorIntakeSubmissionService.submitIntake(instructorId, {
      questions: portal.onboarding.questions.map((question) => ({
        questionId: question.id,
        prompt: question.prompt,
        answer: question.answer,
      })),
      documents: documentChecklist.map((document) => ({
        documentId: document.id,
        name: document.name,
        description: document.description,
        required: document.required,
        fileName: document.fileName,
        fileUrl: document.fileUrl,
        reviewStatus: 'pending',
      })),
      agreedToTerms: portal.onboarding.agreedToTerms,
      selectedModuleIds: portal.onboarding.selectedModuleIds.filter((id) => modulesById.has(id)),
    });

    portal.onboarding.submitted = true;
    portal.workflowStage = 'admin_review';
    this.recordAudit(portal, 'instructor.onboarding.submitted', instructorId);
    return this.buildOnboardingSnapshot(this.repository.save(portal));
  }

  markOnboardingApproved(instructorId: string) {
    const portal = this.repository.findByInstructorId(instructorId);
    portal.workflowStage = 'active';
    this.recordAudit(portal, 'instructor.onboarding.approved', instructorId);
    return this.repository.save(portal);
  }

  markOnboardingRejected(instructorId: string, reason: string) {
    const portal = this.repository.findByInstructorId(instructorId);
    portal.workflowStage = 'rejected';
    this.recordAudit(portal, 'instructor.onboarding.rejected', instructorId, { reason });
    return this.repository.save(portal);
  }

  getAvailableModules() {
    return this.learningResourcesConfigService
      .getConfig()
      .modules.map((module) => ({ id: module.id, title: module.title, summary: module.summary }));
  }

  /**
   * The submitted intake record (questions/documents/approval) is the durable source
   * of truth. If the lighter-weight portal record is ever missing or reset (e.g. a
   * cleared/corrupted cache file), this reconciles it against that intake record
   * instead of silently re-showing onboarding for an already-approved instructor.
   */
  private syncWorkflowState(portal: InstructorPortalState) {
    if (portal.workflowStage !== 'admin_review' && portal.workflowStage !== 'onboarding') {
      return portal;
    }

    const submission = this.instructorIntakeSubmissionService.getInstructorSubmission(portal.profile.id);
    if (!submission) {
      return portal;
    }

    if (portal.workflowStage === 'onboarding' && submission.status === 'pending') {
      // A submission exists but the portal was reset to a blank onboarding state.
      this.restoreOnboardingFromSubmission(portal, submission);
      portal.workflowStage = 'admin_review';
      return this.repository.save(portal);
    }

    if (submission.status === 'approved') {
      this.restoreOnboardingFromSubmission(portal, submission);
      portal.workflowStage = 'active';
      return this.repository.save(portal);
    }

    if (submission.status === 'rejected') {
      this.restoreOnboardingFromSubmission(portal, submission);
      portal.workflowStage = 'rejected';
      return this.repository.save(portal);
    }

    return portal;
  }

  private restoreOnboardingFromSubmission(portal: InstructorPortalState, submission: InstructorIntakeSubmission) {
    const answersByQuestionId = new Map(submission.questions.map((question) => [question.questionId, question.answer]));
    portal.onboarding.questions = portal.onboarding.questions.map((question) => ({
      ...question,
      answer: answersByQuestionId.get(question.id) ?? question.answer,
    }));

    portal.onboarding.readinessUploads = {};
    portal.onboarding.readinessDocumentFiles = {};
    submission.documents.forEach((document) => {
      if (document.fileUrl) {
        portal.onboarding.readinessUploads[document.documentId] = true;
        portal.onboarding.readinessDocumentFiles[document.documentId] = {
          fileName: document.fileName ?? document.name,
          url: document.fileUrl,
          uploadedAt: submission.submittedAt,
        };
      }
    });

    portal.onboarding.agreedToTerms = submission.agreedToTerms;
    portal.onboarding.selectedModuleIds = submission.selectedModuleIds;
    portal.onboarding.submitted = true;
  }

  private assertOnboardingEditable(instructorId: string): InstructorPortalState {
    const portal = this.repository.findByInstructorId(instructorId);

    if (portal.workflowStage !== 'onboarding') {
      throw new BadRequestException('Onboarding can no longer be edited once it has been submitted for review.');
    }

    return portal;
  }

  private buildOnboardingSnapshot(portal: InstructorPortalState) {
    return {
      ...portal.onboarding,
      documentChecklist: this.buildDocumentChecklist(portal.onboarding),
      availableModules: this.getAvailableModules(),
    };
  }

  private buildDocumentChecklist(
    onboarding: Pick<InstructorOnboardingState, 'readinessUploads' | 'readinessDocumentFiles'>,
  ): InstructorDocumentChecklistItem[] {
    return this.documentRequirementsConfigService.getDocumentsFor('instructor').map((document) => {
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

  private trimStringFields<TValue extends Record<string, unknown>>(value: TValue): TValue {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, typeof entry === 'string' ? entry.trim() : entry]),
    ) as TValue;
  }

  private recordAudit(
    portal: InstructorPortalState,
    action: string,
    target: string,
    details?: Record<string, string | number | boolean | undefined>,
  ) {
    const filteredDetails = Object.fromEntries(
      Object.entries(details ?? {}).filter(([, value]) => value !== undefined),
    ) as Record<string, string | number | boolean>;

    const event: InstructorAuditEvent = {
      id: `audit-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      actor: portal.profile.id,
      action,
      target,
      occurredAt: new Date().toISOString(),
      details: Object.keys(filteredDetails).length > 0 ? filteredDetails : undefined,
    };

    portal.auditTrail = [event, ...portal.auditTrail];
  }
}
