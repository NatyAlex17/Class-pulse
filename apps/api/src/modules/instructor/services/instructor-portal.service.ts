import { BadRequestException, Injectable } from '@nestjs/common';

import type {
  AddInstructorStudentNoteDto,
  AssignStudentToSlotDto,
  CreateScheduleSlotDto,
  GenerateInstructorReportDto,
  InstructorAuditEvent,
  InstructorClinicalLog,
  InstructorPortalState,
  InstructorScheduleSlot,
  ReviewClinicalLogDto,
  ReviewSkillChecklistItemDto,
  SendInstructorMessageDto,
  UpdateInstructorAvailabilityDto,
  UpdateInstructorProfileDto,
  UploadInstructorDocumentDto,
} from '../types/instructor-portal.types';
import { InstructorPortalRepository } from './instructor-portal.repository';

@Injectable()
export class InstructorPortalService {
  constructor(private readonly repository: InstructorPortalRepository) {}

  getPortal(instructorId: string) {
    return this.repository.findByInstructorId(instructorId);
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
    return {
      activeStudentId: portal.activeStudentId,
      students: portal.students,
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
    const student = this.getStudentOrThrow(portal, studentId);
    student.recentNotes = [
      {
        date: new Date().toISOString().slice(0, 10),
        note: cleanNote,
        instructor: portal.profile.fullName,
      },
      ...student.recentNotes,
    ];
    this.recordAudit(portal, 'instructor.student.note.added', studentId);
    return this.repository.save(portal).students.find((item) => item.id === studentId);
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
    return this.repository.findByInstructorId(instructorId).skillsWorkspace;
  }

  reviewSkillItem(instructorId: string, itemId: string, payload: ReviewSkillChecklistItemDto) {
    const portal = this.repository.findByInstructorId(instructorId);
    let updated = false;

    portal.skillsWorkspace.groups = portal.skillsWorkspace.groups.map((group) => {
      const nextItems = group.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        updated = true;
        return {
          ...item,
          status: payload.status,
          feedback: payload.feedback?.trim(),
        };
      });

      const verifiedCount = nextItems.filter((item) => item.status === 'Verified').length;
      const progressPercent = Math.round((verifiedCount / nextItems.length) * 100);

      return {
        ...group,
        items: nextItems,
        progressPercent,
      };
    });

    if (!updated) {
      throw new BadRequestException(`Skill checklist item "${itemId}" was not found.`);
    }

    const totalItems = portal.skillsWorkspace.groups.flatMap((group) => group.items).length;
    const verifiedTotal = portal.skillsWorkspace.groups
      .flatMap((group) => group.items)
      .filter((item) => item.status === 'Verified').length;
    portal.skillsWorkspace.completionPercent = Math.round((verifiedTotal / totalItems) * 100);
    portal.skillsWorkspace.savedAt = new Date().toISOString();

    this.recordAudit(portal, 'instructor.skills.item.reviewed', itemId, { status: payload.status });
    return this.repository.save(portal).skillsWorkspace;
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

  private getStudentOrThrow(portal: InstructorPortalState, studentId: string) {
    const student = portal.students.find((item) => item.id === studentId);

    if (!student) {
      throw new BadRequestException(`Student "${studentId}" was not found.`);
    }

    return student;
  }

  private getSlotOrThrow(portal: InstructorPortalState, slotId: string) {
    const slot = portal.schedule.find((item) => item.id === slotId);

    if (!slot) {
      throw new BadRequestException(`Schedule slot "${slotId}" was not found.`);
    }

    return slot;
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
