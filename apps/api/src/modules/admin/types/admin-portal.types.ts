export type AdminApplicationStatus =
  | 'Pending Review'
  | 'Missing Docs'
  | 'Ready'
  | 'Approved'
  | 'Rejected'
  | 'On Hold';

export type AdminChecklistStatus = 'Received' | 'Missing';
export type AdminExportStatus = 'Ready' | 'Queued';
export type AdminTone = 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface AdminProfile {
  id: string;
  fullName: string;
  title: string;
  email: string;
  avatarUrl?: string;
}

export interface AdminKpi {
  label: string;
  value: string;
  tone: AdminTone;
}

export interface AdminAlert {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone: AdminTone;
}

export interface AdminDashboardSnapshot {
  profile: AdminProfile;
  kpis: AdminKpi[];
  alerts: AdminAlert[];
  pipeline: Array<{
    label: string;
    value: number;
    percentage: number;
    tone: AdminTone;
  }>;
  programHealth: Array<{
    name: string;
    score: number;
    status: 'Stable' | 'Watch';
  }>;
  reportingStatus: {
    lastSuiteExport: string;
    readyBundles: number;
  };
}

export interface AdminCohortRecord {
  id: string;
  name: string;
  size: number;
  note: string;
  tone: 'warning' | 'success';
  pendingAdmissions?: number;
  activeInstructors?: number;
  completionRate?: number;
}

export interface AdminEscalationItem {
  id: string;
  title: string;
  group: 'Compliance' | 'Admissions' | 'Scheduling' | 'Financials';
  tone: 'error' | 'warning';
}

export interface AdminOperationsTrendPoint {
  label: string;
  studentSubmissions: number;
  instructorSubmissions: number;
  activeStudents: number;
}

export interface AdminOperationsBreakdownSlice {
  name: string;
  value: number;
}

export interface AdminOperationsModuleRow {
  id: string;
  title: string;
  learners: number;
  avgProgress: number;
  completed: number;
  inProgress: number;
  blocked: number;
}

export interface AdminOperationsQueueRow {
  id: string;
  type: 'Student Intake' | 'Instructor Onboarding';
  candidate: string;
  track: string;
  submittedAt: string;
  status: string;
  documentsComplete: string;
  blockers: string;
}

export interface AdminOperationsHighlight {
  id: string;
  title: string;
  detail: string;
  tone: AdminTone;
}

export interface AdminOperationsSnapshot {
  generatedAt: string;
  metrics: AdminKpi[];
  trend: AdminOperationsTrendPoint[];
  workload: AdminOperationsBreakdownSlice[];
  modules: AdminOperationsModuleRow[];
  cohorts: AdminCohortRecord[];
  escalations: AdminEscalationItem[];
  queue: AdminOperationsQueueRow[];
  highlights: AdminOperationsHighlight[];
}

export interface AdminApplicationDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  stage: string;
  documents: number;
  docsTotal: number;
  updated: string;
  status: AdminApplicationStatus;
  gpa: number;
  highSchoolDiploma: boolean;
  backgroundCheck: boolean;
  interview: boolean;
  interviewScore: number;
  notes: string[];
  appliedDate: string;
}

export interface AdminReviewQueueEntry {
  id: string;
  name: string;
  status: 'Pending Review' | 'Missing Docs' | 'Ready';
  note: string;
  summary: string;
  actions: {
    primary: string;
    secondary: string;
  };
  detailCards: Array<[string, string]>;
  reviewerNotes: string[];
  checklist: Array<[string, AdminChecklistStatus]>;
}

export interface AdminReportCard {
  id: string;
  title: string;
  detail: string;
  badge: string;
}

export type AdminReportRange = '7d' | '30d' | 'quarter';
export type AdminReportFormat = 'CSV' | 'JSON' | 'PDF';

export interface AdminReportDefinition {
  id: string;
  title: string;
  description: string;
  badge: string;
  formats: AdminReportFormat[];
}

export interface AdminReportNarrative {
  title: string;
  text: string;
}

export interface AdminReportTrendPoint {
  label: string;
  applications: number;
  approved: number;
  activeStudents: number;
  activeInstructors: number;
}

export interface AdminReportStatusSlice {
  name: string;
  value: number;
}

export interface AdminReportModulePoint {
  moduleId: string;
  moduleTitle: string;
  learners: number;
  completion: number;
  inProgress: number;
  blocked: number;
}

export interface AdminReportExport {
  id: string;
  reportId?: string;
  report: string;
  scope: string;
  format: string;
  cadence: string;
  updated: string;
  status: AdminExportStatus;
  owner?: string;
  range?: AdminReportRange;
}

export interface AdminReportsWorkspace {
  generatedAt: string;
  selectedRange: AdminReportRange;
  availableRanges: AdminReportRange[];
  cards: AdminReportCard[];
  reports: AdminReportDefinition[];
  summaryMetrics: Array<{
    id: string;
    label: string;
    value: string;
    delta: string;
    tone: AdminTone;
    note?: string;
  }>;
  narratives: AdminReportNarrative[];
  enrollmentTrend: AdminReportTrendPoint[];
  applicationStatus: AdminReportStatusSlice[];
  modulePerformance: AdminReportModulePoint[];
  exports: AdminReportExport[];
}

export interface AdminDocumentRecord {
  id: string;
  name: string;
  category: 'Policy' | 'Admissions' | 'Operations' | 'Compliance' | 'Financial';
  owner: string;
  updated: string;
  status: 'Approved' | 'Pending' | 'Needs update';
}

export interface AdminCurriculumSummary {
  modules: number;
  activeTracks: number;
  lastUpdated: string;
  note: string;
}

export interface AdminFinancialSummary {
  outstandingBalance: number;
  collectedThisMonth: number;
  paymentPlansActive: number;
  note: string;
}

export interface AdminSettingsSummary {
  applicationWindowsOpen: boolean;
  autoEnrollmentEnabled: boolean;
  lastReviewed: string;
}

export interface AdminAuditEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  occurredAt: string;
  details?: Record<string, string | number | boolean>;
}

export interface AdminPortalState {
  profile: AdminProfile;
  dashboard: AdminDashboardSnapshot;
  operations: AdminOperationsSnapshot;
  applications: AdminApplicationDetail[];
  activeApplicationId: string;
  reviewQueue: AdminReviewQueueEntry[];
  activeReviewQueueId: string;
  reports: AdminReportsWorkspace;
  documents: AdminDocumentRecord[];
  cohorts: AdminCohortRecord[];
  curriculum: AdminCurriculumSummary;
  financials: AdminFinancialSummary;
  settings: AdminSettingsSummary;
  auditTrail: AdminAuditEvent[];
}

export interface UpdateAdminApplicationStatusDto {
  status: AdminApplicationStatus;
  reason?: string;
}

export interface AddAdminApplicationNoteDto {
  note: string;
}

export interface SelectAdminApplicationDto {
  applicationId: string;
}

export interface SelectAdminReviewQueueDto {
  queueId: string;
}

export interface UploadAdminDocumentDto {
  name: string;
  category: 'Policy' | 'Admissions' | 'Operations' | 'Compliance' | 'Financial';
  owner: string;
  status?: 'Approved' | 'Pending' | 'Needs update';
}

export interface GenerateAdminReportExportDto {
  reportId: string;
  format: string;
  range?: AdminReportRange;
}

export interface CreateAuditorAccountDto {
  email: string;
  password: string;
  fullName?: string;
}

export interface AdminAuditorAccount {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  title: string;
}
