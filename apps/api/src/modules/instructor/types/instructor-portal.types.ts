export type StudentRiskLevel = 'Stable' | 'Watch' | 'Urgent';
export type StudentProgressStatus = 'On Track' | 'At Risk' | 'Watch';
export type ConversationStatus = 'Active' | 'Needs response' | 'Resolved';
export type SkillItemStatus = 'Verified' | 'Needs observation' | 'Ready for signoff';
export type ClinicalLogReviewStatus = 'Pending' | 'Verified' | 'Flagged';
export type InstructorDocumentStatus = 'Approved' | 'Pending' | 'Needs update';
export type InstructorExportStatus = 'Ready' | 'Queued';

export interface InstructorCredential {
  id: string;
  label: string;
  status: 'Active' | 'Renewal due' | 'Expired';
  expiresAt: string;
}

export interface InstructorProfile {
  id: string;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  notes: string;
  avatarUrl?: string;
  credentials: InstructorCredential[];
}

export interface InstructorStudentNote {
  date: string;
  note: string;
  instructor: string;
}

export interface InstructorStudentSkill {
  name: string;
  level: 'Competent' | 'Developing' | 'Novice';
}

export interface InstructorStudentRecord {
  id: string;
  name: string;
  cohort: string;
  placement: string;
  checklistCompleted: number;
  checklistTotal: number;
  clinicalHoursCompleted: number;
  clinicalHoursRequired: number;
  risk: StudentRiskLevel;
  email: string;
  phone: string;
  city: string;
  startDate: string;
  certificationStatus: string;
  progressPercent: number;
  absences: number;
  attendanceRate: number;
  engagementScore: number;
  recentNotes: InstructorStudentNote[];
  skills: InstructorStudentSkill[];
}

export interface InstructorDashboardMetric {
  label: string;
  value: string;
  tone: 'primary' | 'success' | 'warning' | 'error';
}

export interface InstructorPriorityAction {
  id: string;
  title: string;
  detail: string;
  href: string;
  urgency: 'high' | 'medium' | 'critical';
}

export interface InstructorUpcomingSession {
  id: string;
  date: string;
  time: string;
  title: string;
  site: string;
  students: number;
}

export interface InstructorDashboardSnapshot {
  profile: Pick<InstructorProfile, 'id' | 'fullName' | 'title'>;
  metrics: InstructorDashboardMetric[];
  priorityActions: InstructorPriorityAction[];
  students: Array<{
    id: string;
    name: string;
    cohort: string;
    hoursLogged: number;
    hoursRequired: number;
    checklistCompletion: number;
    status: StudentProgressStatus;
    progress: number;
  }>;
  sessions: InstructorUpcomingSession[];
  studentsNeedingReview: Array<{
    id: string;
    name: string;
    issue: string;
    status: string;
    priority: 'high' | 'medium' | 'critical';
  }>;
}

export interface InstructorConversationMessage {
  id: string;
  from: 'student' | 'instructor';
  body: string;
  stamp: string;
}

export interface InstructorConversation {
  id: string;
  name: string;
  note: string;
  time: string;
  cohort?: string;
  placement?: string;
  status: ConversationStatus;
  messages: InstructorConversationMessage[];
}

export interface ScheduledStudent {
  id: string;
  name: string;
  cohort: string;
}

export interface InstructorScheduleSlot {
  id: string;
  weekStart: string;
  day: number;
  time: string;
  students: ScheduledStudent[];
  notes: string;
}

export interface SkillChecklistItem {
  id: string;
  label: string;
  status: SkillItemStatus;
  feedback?: string;
}

export interface SkillChecklistGroup {
  id: string;
  title: string;
  progressPercent: number;
  items: SkillChecklistItem[];
}

export interface InstructorSkillsWorkspace {
  studentId: string;
  studentName: string;
  autosave: boolean;
  savedAt: string;
  completionPercent: number;
  groups: SkillChecklistGroup[];
}

export interface InstructorClinicalLog {
  id: string;
  studentId: string;
  student: string;
  site: string;
  date: string;
  hours: number;
  status: ClinicalLogReviewStatus;
  note?: string;
}

export interface InstructorAvailabilityState {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  weekend: string;
  allowAutoPlacement: boolean;
  travelBuffer: boolean;
  conflicts: string[];
}

export interface InstructorDocument {
  id: string;
  name: string;
  category: string;
  owner: string;
  updated: string;
  status: InstructorDocumentStatus;
}

export interface InstructorReportCard {
  id: string;
  title: string;
  detail: string;
  badge: string;
}

export interface InstructorReportExport {
  id: string;
  report: string;
  format: string;
  cadence: string;
  updated: string;
  status: InstructorExportStatus;
}

export interface InstructorReportsWorkspace {
  cards: InstructorReportCard[];
  exports: InstructorReportExport[];
}

export interface InstructorAuditEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  occurredAt: string;
  details?: Record<string, string | number | boolean>;
}

export interface InstructorPortalState {
  profile: InstructorProfile;
  students: InstructorStudentRecord[];
  activeStudentId: string;
  dashboard: InstructorDashboardSnapshot;
  conversations: InstructorConversation[];
  activeConversationId: string;
  schedule: InstructorScheduleSlot[];
  skillsWorkspace: InstructorSkillsWorkspace;
  clinicalLogs: InstructorClinicalLog[];
  availability: InstructorAvailabilityState;
  documents: InstructorDocument[];
  reports: InstructorReportsWorkspace;
  auditTrail: InstructorAuditEvent[];
}

export interface UpdateInstructorProfileDto {
  fullName?: string;
  title?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface AddInstructorStudentNoteDto {
  note: string;
}

export interface SelectConversationDto {
  conversationId: string;
}

export interface SendInstructorMessageDto {
  conversationId: string;
  body: string;
}

export interface CreateScheduleSlotDto {
  weekStart: string;
  day: number;
  time: string;
  notes?: string;
}

export interface AssignStudentToSlotDto {
  studentId: string;
  notes?: string;
}

export interface RemoveStudentFromSlotDto {
  studentId: string;
}

export interface ReviewSkillChecklistItemDto {
  status: SkillItemStatus;
  feedback?: string;
}

export interface ReviewClinicalLogDto {
  status: ClinicalLogReviewStatus;
  note?: string;
}

export interface UpdateInstructorAvailabilityDto {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  weekend?: string;
  allowAutoPlacement?: boolean;
  travelBuffer?: boolean;
}

export interface UploadInstructorDocumentDto {
  name: string;
  category: string;
  owner: string;
  status?: InstructorDocumentStatus;
}

export interface GenerateInstructorReportDto {
  reportId: string;
  format: string;
}
