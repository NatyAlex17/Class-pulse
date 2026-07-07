export type StudentWorkflowStage =
  | 'entrance_exam'
  | 'enrollment_wizard'
  | 'admin_review'
  | 'orientation_survey'
  | 'active';

export type ModuleStatus = 'Complete' | 'In Progress' | 'Locked';
export type MessageStatus = 'Unread' | 'New' | 'Read';
export type DocumentStatus = 'Verified' | 'Pending Review' | 'Missing';
export type PaymentStatus = 'Completed' | 'Upcoming';
export type ClinicalLogStatus = 'Verified' | 'Pending';
export type AttendanceType = 'Theory' | 'Clinical';
export type AttendanceStatus = 'Present' | 'Planned Absence' | 'Unplanned Absence';

export interface StudentProfile {
  id: string;
  fullName: string;
  preferredName?: string;
  email: string;
  phone: string;
  location: string;
  cohort: string;
  /** Id of the configured cohort the student registered into (drives module access and fees). */
  cohortId?: string;
  levelLabel: string;
  studentNumber: string;
}

export interface DashboardActionItem {
  id: string;
  title: string;
  detail: string;
  complete: boolean;
  urgent?: boolean;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  current: number;
  target: number;
  unit?: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  complete: boolean;
  actionLabel: string;
}

export interface OnboardingQuestion {
  id: string;
  prompt: string;
  answer: string;
}

export interface OnboardingAcknowledgements {
  schedule: boolean;
  attendance: boolean;
  technology: boolean;
}

export type ReadinessUploads = Record<string, boolean>;

export interface ReadinessDocumentFile {
  fileName: string;
  url: string;
  uploadedAt: string;
}

export type ReadinessDocumentFiles = Record<string, ReadinessDocumentFile>;

export interface DocumentChecklistItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  uploaded: boolean;
  fileName?: string;
  fileUrl?: string;
}

export interface OnboardingState {
  workflowStage: StudentWorkflowStage;
  steps: OnboardingStep[];
  questions: OnboardingQuestion[];
  acknowledgements: OnboardingAcknowledgements;
  readinessUploads: ReadinessUploads;
  readinessDocumentFiles: ReadinessDocumentFiles;
  submitted: boolean;
}

export interface OnboardingSnapshot extends OnboardingState {
  documentChecklist: DocumentChecklistItem[];
}

export type LearningStepType = 'Video' | 'PDF' | 'Link' | 'Reading' | 'Skill Check' | 'Quiz';

/** Exam question as exposed to the student — correct answers stay server-side. */
export interface LearningStepExamQuestion {
  id: string;
  prompt: string;
  points: number;
  options?: string[];
}

export interface LearningStep {
  id: string;
  title: string;
  type: LearningStepType;
  duration: string;
  note: string;
  complete: boolean;
  resourceUrl?: string;
  content?: string;
  sectionId?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  examFormat?: 'text' | 'multiple-choice';
  passingScore?: number;
  questionCount?: number;
  questions?: LearningStepExamQuestion[];
}

export interface CurriculumModule {
  id: string;
  title: string;
  summary: string;
  status: ModuleStatus;
  progressPercent: number;
  requiredHours: number;
  completedHours: number;
  /** Real learning time recorded against this module, in minutes. */
  sessionMinutes?: number;
  examScore?: string;
  certificateUnlocked: boolean;
  steps: LearningStep[];
}

export interface ExamQuestionDefinition {
  id: string;
  prompt: string;
  points: number;
  /** Optional reference answer shown to graders for open-ended questions. */
  expectedAnswer?: string;
  /** Multiple-choice only. */
  options?: string[];
  /** Index into options identifying the correct answer. Multiple-choice only. */
  correctOption?: number;
}

export interface LearningResourceDefinition {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'link' | 'text' | 'exam';
  duration: string;
  description: string;
  url?: string;
  content?: string;
  questionCount?: number;
  passingScore?: number;
  examFormat?: 'text' | 'multiple-choice';
  questions?: ExamQuestionDefinition[];
}

export interface LearningSectionDefinition {
  id: string;
  title: string;
  description: string;
  resources: LearningResourceDefinition[];
}

export interface LearningModuleDefinition {
  id: string;
  title: string;
  summary: string;
  requiredHours: number;
  moduleFee: number;
  order: number;
  minimumHoursForCertification?: number;
  sections: LearningSectionDefinition[];
}

export interface StudentMessage {
  id: string;
  sender: 'student' | 'staff' | 'system';
  text: string;
  time: string;
}

export interface StudentThread {
  id: string;
  recipientName: string;
  recipientRole: string;
  moduleId: string;
  moduleName: string;
  status: MessageStatus;
  preview: string;
  time: string;
  unread: boolean;
  messages: StudentMessage[];
}

export interface AiTutorMessage {
  id: string;
  role: 'student' | 'tutor';
  text: string;
  sentAt: string;
}

export interface AiTutorConversation {
  moduleId: string;
  lessonId: string;
  updatedAt: string;
  messages: AiTutorMessage[];
}

export interface AskAiTutorDto {
  question: string;
}

export interface ClinicalLogEntry {
  id: string;
  date: string;
  moduleId: string;
  moduleTitle: string;
  hours: number;
  instructor: string;
  status: ClinicalLogStatus;
  note?: string;
}

export interface ClinicalSession {
  id: string;
  title: string;
  date: string;
  location: string;
  instructor: string;
  type: AttendanceType;
  status: 'Scheduled' | 'Pending Scheduling' | 'Completed';
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  stripePaymentIntentId?: string;
}

export interface FinancialSummary {
  totalTuition: number;
  amountPaid: number;
  balance: number;
  depositRequired: number;
  depositPaid: boolean;
  status: 'Current' | 'Payment Due' | 'Past Due';
  paymentPlan: PaymentRecord[];
}

export interface StudentDocument {
  id: string;
  title: string;
  category: 'admissions' | 'academic' | 'clinical' | 'compliance';
  subtitle: string;
  status: DocumentStatus;
  submittedAt: string;
  required: boolean;
  fileName?: string;
}

export interface StudentForm {
  id: string;
  title: string;
  status: 'Ready' | 'Pending Signature' | 'Submitted';
  description: string;
  lastUpdated: string;
  actionLabel: string;
}

export interface StudentAuditEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  occurredAt: string;
  details?: Record<string, string | number | boolean>;
}

export type StudentViolationContext = 'secure_exam' | 'learning_session';
export type StudentViolationTone = 'warning' | 'error' | 'info';

export interface StudentViolationLogEntry {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  context: StudentViolationContext;
  contextLabel: string;
  type: string;
  label: string;
  tone: StudentViolationTone;
  moduleId?: string;
  moduleTitle?: string;
  stepId?: string;
  warningsAtEvent?: number;
  detail?: string;
  occurredAt: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  type: AttendanceType;
  status: AttendanceStatus;
  note: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  due: string;
  detail: string;
  moduleId: string;
  status: 'Pending' | 'Submitted';
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: 'Open' | 'In Review' | 'Resolved';
  createdAt: string;
}

export interface StudentSettings {
  email_updates: boolean;
  sms_alerts: boolean;
  remember_device: boolean;
}

export type IntakeQuestionReviewStatus = 'pending' | 'correct' | 'wrong';

export interface SubmittedEntranceExamQuestion {
  questionId: string;
  prompt: string;
  type: 'choice' | 'text';
  preferredAnswer: string;
  options: IntakeOptionDefinition[];
  studentAnswer: string;
  reviewStatus: IntakeQuestionReviewStatus;
}

export type IntakeDocumentReviewStatus = 'pending' | 'approved' | 'rejected';

export interface SubmittedIntakeDocument {
  documentId: string;
  name: string;
  description: string;
  required: boolean;
  fileName?: string;
  fileUrl?: string;
  reviewStatus: IntakeDocumentReviewStatus;
}

export interface CdphForm {
  lastName: string;
  firstName: string;
  dob: string;
  phone: string;
  email: string;
  city: string;
  zip: string;
  conviction: boolean;
  convictionDetails: string;
}

export interface EntranceExamState {
  answers: Record<string, string>;
  score: number | null;
  totalQuestions: number;
  rank: string | null;
  taken: boolean;
  passed: boolean;
  submittedAt?: string;
}

export interface IntakeOptionDefinition {
  label: string;
  value: string;
  description?: string;
  badge?: string;
}

export interface IntakeFieldDefinition {
  id: string;
  label: string;
  type: 'choice' | 'text' | 'textarea' | 'select';
  placeholder?: string;
  options?: IntakeOptionDefinition[];
}

export interface IntakeStageDefinition {
  id: StudentWorkflowStage;
  label: string;
}

export interface EntranceExamQuestionDefinition {
  id: string;
  prompt: string;
  type: 'choice' | 'text';
  placeholder?: string;
  preferredAnswer: string;
  options: IntakeOptionDefinition[];
}

export interface EnrollmentWizardStepDefinition {
  step: number;
  title: string;
  description: string;
  sections: Array<{
    id: string;
    title: string;
    description?: string;
    fields: IntakeFieldDefinition[];
  }>;
}

export interface IntakeSurveySectionDefinition {
  id: string;
  title: string;
  description?: string;
  fields: IntakeFieldDefinition[];
}

export interface StudentIntakeJourneyConfig {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  stages: IntakeStageDefinition[];
  entranceExam: {
    intro: string;
    passingScore: number;
    questions: EntranceExamQuestionDefinition[];
  };
  enrollmentWizard: {
    steps: EnrollmentWizardStepDefinition[];
    signatureRequirement: {
      value: string;
      hint: string;
    };
    summaryItems: Array<{
      id: string;
      label: string;
    }>;
  };
  adminReview: {
    badgeLabel: string;
    title: string;
    description: string;
    checklist: string[];
  };
  orientationSurvey: {
    sections: IntakeSurveySectionDefinition[];
  };
  activation: {
    badgeLabel: string;
    title: string;
    description: string;
    checklist: string[];
  };
}

export interface EnrollmentWizardState {
  step: number;
  hhaAddon: boolean;
  scrubTop: string;
  scrubBottom: string;
  shipping: 'pickup' | 'ship';
  wantsToTestAtDaisy: boolean | null;
  agreements: {
    ip: boolean;
    refund: boolean;
    conduct: boolean;
    lateFee: boolean;
  };
  signature: string;
  submitted: boolean;
}

export interface EntranceSurveyState {
  step: number;
  answers: Record<string, string>;
  completed: boolean;
}

export interface StudentPortalState {
  profile: StudentProfile;
  workflowStage: StudentWorkflowStage;
  intakeJourney: StudentIntakeJourneyConfig;
  tasks: DashboardActionItem[];
  onboarding: OnboardingState;
  modules: CurriculumModule[];
  activeModuleId: string;
  threads: StudentThread[];
  activeThreadId: string;
  aiTutorConversations: AiTutorConversation[];
  clinicalSessions: ClinicalSession[];
  clinicalLogs: ClinicalLogEntry[];
  financials: FinancialSummary;
  documents: StudentDocument[];
  forms: StudentForm[];
  auditTrail: StudentAuditEvent[];
  entranceExam: EntranceExamState;
  enrollmentWizard: EnrollmentWizardState;
  entranceSurvey: EntranceSurveyState;
  settings: StudentSettings;
  attendanceRecords: AttendanceRecord[];
  assignments: AssignmentItem[];
  supportTickets: SupportTicket[];
  cdphForm: CdphForm;
  cdphSigned: boolean;
  liveScanGenerated: boolean;
  liveScanUploaded: boolean;
  textbookIssued: boolean;
  textbookOpened: boolean;
  exitSurveyComplete: boolean;
  learningMinutes: number;
  learningSessionActive: boolean;
  /** Currently active lesson receiving elapsed learning time. */
  activeLessonId?: string;
  /** Per-lesson persisted elapsed learning time, in minutes. */
  lessonElapsedMinutes: Record<string, number>;
  activeLearningAttention?: ActiveLearningAttention;
  activeExamSession?: ActiveExamSession;
  reflectionResponse: string;
  questionOfDayAnswer: string;
  lastAction: string;
}

export interface StudentDashboardSnapshot {
  profile: StudentProfile;
  workflowStage: StudentWorkflowStage;
  metrics: DashboardMetric[];
  currentModule: CurriculumModule;
  tasks: DashboardActionItem[];
  upcomingSessions: ClinicalSession[];
  unreadCount: number;
  completedOnboardingCount: number;
  onboardingStepCount: number;
  overallProgressPercent: number;
}

export interface StudentIntakeSnapshot {
  workflowStage: StudentWorkflowStage;
  intakeJourney: StudentIntakeJourneyConfig;
  entranceExam: EntranceExamState;
  enrollmentWizard: EnrollmentWizardState;
  entranceSurvey: EntranceSurveyState;
}

export interface UpdateWorkflowStageDto {
  workflowStage: StudentWorkflowStage;
}

export interface StudentLearningSnapshot {
  activeModuleId: string;
  currentModule: CurriculumModule;
  modules: CurriculumModule[];
  learningMinutes: number;
  sessionMinutes: number;
  requiredSessionMinutes: number;
  learningSessionActive: boolean;
  activeLessonId?: string;
  lessonElapsedMinutes: Record<string, number>;
  activeLearningAttention?: ActiveLearningAttention;
  activeExamSession?: ActiveExamSession;
  examUnlocked: boolean;
  textbookIssued: boolean;
  textbookOpened: boolean;
  exitSurveyComplete: boolean;
  moduleCertificatesReady: number;
  programCertificateReady: boolean;
}

export interface StudentAttendanceSummary {
  todayTheoryCheckedIn: boolean;
  todayClinicalCheckedIn: boolean;
  records: AttendanceRecord[];
}

export interface StudentFormsWorkspace {
  forms: StudentForm[];
  cdphForm: CdphForm;
  cdphSigned: boolean;
  liveScanGenerated: boolean;
  liveScanUploaded: boolean;
}

export interface StudentCertificatesSummary {
  moduleCertificatesReady: number;
  totalModules: number;
  programCertificateReady: boolean;
  modules: Array<{
    id: string;
    title: string;
    unlocked: boolean;
    examScore?: string;
  }>;
}

export interface TextAnswerDto {
  answer: string;
}

export interface AnswerOnboardingQuestionDto {
  answer: string;
}

export interface UpdateOnboardingAcknowledgementsDto {
  schedule?: boolean;
  attendance?: boolean;
  technology?: boolean;
}

export type UpdateReadinessUploadsDto = Record<string, boolean>;

export interface SendStudentMessageDto {
  threadId?: string;
  recipientName: string;
  recipientRole: string;
  moduleId: string;
  moduleName: string;
  text: string;
}

export interface LogClinicalHoursDto {
  date: string;
  moduleId: string;
  moduleTitle: string;
  hours: number;
  instructor: string;
  note?: string;
}

export interface RecordPaymentDto {
  amount: number;
  method: string;
  date?: string;
  stripePaymentIntentId?: string;
}

export interface UploadStudentDocumentDto {
  title: string;
  category: 'admissions' | 'academic' | 'clinical' | 'compliance';
  subtitle: string;
  status?: DocumentStatus;
  submittedAt?: string;
  required?: boolean;
  fileName?: string;
}

export interface ReplaceStudentDocumentDto {
  subtitle?: string;
  fileName?: string;
}

export interface UpdateStudentProfileDto {
  fullName?: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  location?: string;
}

export interface UpdateEnrollmentWizardDto {
  hhaAddon?: boolean;
  scrubTop?: string;
  scrubBottom?: string;
  shipping?: 'pickup' | 'ship';
  wantsToTestAtDaisy?: boolean | null;
  signature?: string;
}

export interface UpdateEnrollmentWizardAgreementsDto {
  ip?: boolean;
  refund?: boolean;
  conduct?: boolean;
  lateFee?: boolean;
}

export interface UpdateWizardStepDto {
  step: number;
}

export interface UpdateSettingDto {
  email_updates?: boolean;
  sms_alerts?: boolean;
  remember_device?: boolean;
}

export interface AdvanceLearningDto {
  minutes?: number;
}

export type LearningAttentionEventType = 'visibility_hidden' | 'window_blur' | 'session_paused';

export interface LearningAttentionEvent {
  id: string;
  type: LearningAttentionEventType;
  occurredAt: string;
  detail?: string;
}

export interface ActiveLearningAttention {
  moduleId: string;
  lessonId: string;
  startedAt: string;
  lastActivityAt: string;
  focusLossCount: number;
  visibilityLossCount: number;
  manualPauseCount: number;
  warnings: number;
  recentEvents: LearningAttentionEvent[];
}

export type ExamSecurityEventType =
  | 'visibility_hidden'
  | 'window_blur'
  | 'fullscreen_exit'
  | 'navigation_blocked'
  | 'shortcut_blocked'
  | 'context_menu'
  | 'copy_attempt'
  | 'paste_attempt'
  | 'back_button_blocked';

export interface ExamSecurityEvent {
  id: string;
  type: ExamSecurityEventType;
  occurredAt: string;
  detail?: string;
}

export interface ActiveExamSession {
  moduleId: string;
  stepId: string;
  startedAt: string;
  lastActivityAt: string;
  focusLossCount: number;
  visibilityLossCount: number;
  fullscreenExitCount: number;
  shortcutBlockCount: number;
  copyPasteCount: number;
  navigationAttemptCount: number;
  warnings: number;
  recentEvents: ExamSecurityEvent[];
}

export interface SetLearningSessionDto {
  active: boolean;
}

export interface ReportLearningAttentionEventDto {
  type: LearningAttentionEventType;
  detail?: string;
}

export interface StartModuleExamSessionDto {
  stepId: string;
}

export interface ReportExamSecurityEventDto {
  type: ExamSecurityEventType;
  detail?: string;
}

export interface SelectModuleDto {
  moduleId: string;
}

export interface RegisterCohortDto {
  cohortId: string;
  paymentIntentId?: string;
}

export interface CreateEnrollmentPaymentIntentDto {
  cohortId: string;
}

export interface EnrollmentPaymentIntentSnapshot {
  cohortId: string;
  cohortName: string;
  amount: number;
  currency: string;
  clientSecret: string;
  publishableKey: string;
}

export interface AvailableCohort {
  id: string;
  name: string;
  description: string;
  feeAmount: number;
  moduleCount: number;
  moduleTitles: string[];
}

export interface StudentCohortsSnapshot {
  registeredCohortId: string | null;
  registeredCohortName: string | null;
  cohorts: AvailableCohort[];
}

export interface SubmitModuleExamDto {
  /** Quiz step the answers belong to. */
  stepId?: string;
  /** questionId → answer. Multiple-choice answers are the selected option index as a string. */
  answers?: Record<string, string>;
}

export interface ModuleExamResult {
  graded: boolean;
  passed: boolean;
  scorePercent: number;
  earnedPoints: number;
  totalPoints: number;
  passingScore: number;
  correctCount: number;
  totalQuestions: number;
}

export interface SubmitModuleExamResponse {
  module: CurriculumModule;
  result: ModuleExamResult;
}

export interface AttendanceCheckInDto {
  type: AttendanceType;
}

export interface ReportAbsenceDto {
  kind: 'today' | 'future';
}

export interface SubmitSupportTicketDto {
  subject: string;
  category: string;
  message: string;
}

export interface UpdateCdphFormDto {
  lastName?: string;
  firstName?: string;
  dob?: string;
  phone?: string;
  email?: string;
  city?: string;
  zip?: string;
  conviction?: boolean;
  convictionDetails?: string;
}

export type IntakeApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface StudentIntakeSubmission {
  id: string;
  studentId: string;
  status: IntakeApprovalStatus;
  entranceExamScore: number | null;
  entranceExamPassed: boolean | null;
  passingScore: number;
  questions: SubmittedEntranceExamQuestion[];
  documents: SubmittedIntakeDocument[];
  enrollmentData: EnrollmentWizardState;
  submittedAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  reviewedBy?: string;
}

export interface SubmitStudentIntakeDto {
  entranceExamScore: number | null;
  entranceExamPassed: boolean | null;
  passingScore: number;
  questions: SubmittedEntranceExamQuestion[];
  documents: SubmittedIntakeDocument[];
  enrollmentData: EnrollmentWizardState;
}

export interface ApproveIntakeDto {
  approved: boolean;
  rejectionReason?: string;
  questionReviews?: Record<string, 'correct' | 'wrong'>;
  documentReviews?: Record<string, 'approved' | 'rejected'>;
}
