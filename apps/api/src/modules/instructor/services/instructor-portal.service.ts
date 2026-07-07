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
  InstructorDocumentChecklistItem,
  InstructorIntakeSubmission,
  InstructorOnboardingState,
  InstructorPortalState,
  InstructorScheduleSlot,
  InstructorSkillsWorkspace,
  InstructorStudentRecord,
  ReviewClinicalLogDto,
  ReviewSkillChecklistItemDto,
  SelectInstructorModulesDto,
  SendInstructorMessageDto,
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

  getClinicalLogs(instructorId: string) {
    return this.repository.findByInstructorId(instructorId).clinicalLogs;
  }

  reviewClinicalLog(instructorId: string, logId: string, payload: ReviewClinicalLogDto) {
    const portal = this.repository.findByInstructorId(instructorId);
    const log = portal.clinicalLogs.find((item) => item.id === logId);

    if (!log) {
      throw new BadRequestException(`Clinical log "${logId}" was not found.`);
    }

    log.status = payload.status;
    log.note = payload.note?.trim() || log.note;
    this.recordAudit(portal, 'instructor.clinical-log.reviewed', logId, { status: payload.status });
    return this.repository.save(portal).clinicalLogs.find((item) => item.id === logId);
  }

  getAvailability(instructorId: string) {
    return this.repository.findByInstructorId(instructorId).availability;
  }

  updateAvailability(instructorId: string, payload: UpdateInstructorAvailabilityDto) {
    const portal = this.repository.findByInstructorId(instructorId);
    portal.availability = {
      ...portal.availability,
      ...this.trimStringFields({ ...payload }),
    };
    this.recordAudit(portal, 'instructor.availability.updated', 'availability', { ...payload });
    return this.repository.save(portal).availability;
  }

  getDocuments(instructorId: string) {
    return this.repository.findByInstructorId(instructorId).documents;
  }

  uploadDocument(instructorId: string, payload: UploadInstructorDocumentDto) {
    if (!payload.name.trim() || !payload.category.trim() || !payload.owner.trim()) {
      throw new BadRequestException('Document name, category, and owner are required.');
    }

    const portal = this.repository.findByInstructorId(instructorId);
    const document = {
      id: `doc-${Date.now()}`,
      name: payload.name.trim(),
      category: payload.category.trim(),
      owner: payload.owner.trim(),
      updated: new Date().toISOString().slice(0, 10),
      status: payload.status ?? 'Pending',
    };

    portal.documents = [document, ...portal.documents];
    this.recordAudit(portal, 'instructor.document.uploaded', document.id);
    return this.repository.save(portal).documents[0];
  }

  getReports(instructorId: string) {
    return this.repository.findByInstructorId(instructorId).reports;
  }

  generateReportExport(instructorId: string, payload: GenerateInstructorReportDto) {
    const portal = this.repository.findByInstructorId(instructorId);
    const card = portal.reports.cards.find((item) => item.id === payload.reportId);

    if (!card) {
      throw new BadRequestException(`Report "${payload.reportId}" was not found.`);
    }

    const exportRow = {
      id: `export-${Date.now()}`,
      report: card.title,
      format: payload.format.trim().toUpperCase(),
      cadence: 'On demand',
      updated: new Date().toISOString(),
      status: 'Queued' as const,
    };

    portal.reports.exports = [exportRow, ...portal.reports.exports];
    this.recordAudit(portal, 'instructor.report.export.generated', exportRow.id, {
      reportId: payload.reportId,
      format: exportRow.format,
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
        };

        return record;
      });
  }

  private getSlotOrThrow(portal: InstructorPortalState, slotId: string) {
    const slot = portal.schedule.find((item) => item.id === slotId);

    if (!slot) {
      throw new BadRequestException(`Schedule slot "${slotId}" was not found.`);
    }

    return slot;
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
