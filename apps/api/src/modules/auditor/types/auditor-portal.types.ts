export type AuditorTone = 'primary' | 'success' | 'warning' | 'error' | 'info';
export type AuditorStudentStatus = 'On Track' | 'At Risk' | 'Complete';
export type AuditorInstructorStatus = 'Compliant' | 'Review Required' | 'Expired';
export type AuditorComplianceStatus = 'Compliant' | 'At Risk' | 'Non-Compliant';
export type AuditorDocumentStatus = 'Current' | 'Needs Review' | 'Archived';
export type AuditorExportStatus = 'Ready' | 'Queued' | 'Requires Review';
export type AuditorEventStatus = 'Success' | 'Alert' | 'Review';

export interface AuditorProfile {
  id: string;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  memberSince: string;
  status: 'Active' | 'Inactive';
  credentials: string[];
  assignedPrograms: string[];
}

export interface AuditorKpi {
  label: string;
  value: string;
  tone: AuditorTone;
  note: string;
}

export interface AuditorSummaryCard {
  id: string;
  title: string;
  detail: string;
  badge: string;
  tone: AuditorTone;
}

export interface AuditorReadinessMetric {
  id: string;
  label: string;
  value: number;
  tone: AuditorTone;
}

export interface AuditorExceptionItem {
  id: string;
  title: string;
  detail: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Monitoring' | 'Resolved';
}

export interface AuditorDashboardSnapshot {
  profile: AuditorProfile;
  cohortLabel: string;
  kpis: AuditorKpi[];
  summaryCards: AuditorSummaryCard[];
  evidenceReadiness: AuditorReadinessMetric[];
  openExceptions: AuditorExceptionItem[];
  auditTrailSnapshot: {
    lastEvidenceExport: string;
    latestVerificationEvent: string;
    certificationBatch: string;
  };
}

export interface AuditorStudentRecord {
  id: string;
  name: string;
  cohort: string;
  status: AuditorStudentStatus;
  recordsComplete: string;
  lastReview: string;
  theoryHours: number;
  clinicalHours: number;
  attendanceRate: number;
  certificationEligibility: 'Eligible' | 'Blocked' | 'Pending Review';
  missingEvidence: string[];
  notes: string[];
}

export interface AuditorStudentRecordsWorkspace {
  summary: {
    totalStudents: number;
    recordsCompleteAverage: string;
    needsReview: number;
  };
  activeStudentId: string;
  records: AuditorStudentRecord[];
}

export interface AuditorInstructorQualificationRecord {
  id: string;
  name: string;
  role: string;
  credentials: string[];
  certifications: {
    valid: number;
    expired: number;
  };
  status: AuditorInstructorStatus;
  lastReview: string;
  nextExpiration: string;
  notes: string[];
}

export interface AuditorInstructorQualificationsWorkspace {
  summary: {
    totalInstructors: number;
    compliant: number;
    reviewRequired: number;
  };
  activeInstructorId: string;
  instructors: AuditorInstructorQualificationRecord[];
}

export interface AuditorClinicalComplianceItem {
  id: string;
  category: string;
  standard: string;
  status: AuditorComplianceStatus;
  details: string;
  lastAudit: string;
  evidenceLinks: string[];
  actionRequired?: string;
}

export interface AuditorClinicalComplianceWorkspace {
  summary: {
    complianceRate: string;
    issuesOpen: number;
    lastAudit: string;
  };
  items: AuditorClinicalComplianceItem[];
  immediateAction: {
    title: string;
    detail: string;
    targetItemId: string;
  };
}

export interface AuditorProgramRequirementItem {
  id: string;
  item: string;
  completed: boolean;
}

export interface AuditorProgramRequirementRecord {
  id: string;
  name: string;
  completion: string;
  theoryHoursRequired: number;
  clinicalHoursRequired: number;
  stateExamRequired: boolean;
  requirements: AuditorProgramRequirementItem[];
}

export interface AuditorProgramRequirementsWorkspace {
  activeProgramId: string;
  programs: AuditorProgramRequirementRecord[];
}

export interface AuditorDocumentRecord {
  id: string;
  title: string;
  type: 'Spreadsheet' | 'PDF' | 'Archive' | 'Transcript' | 'Bundle';
  category: 'Attendance' | 'Clinical' | 'Instructor' | 'Policy' | 'Regulatory';
  status: AuditorDocumentStatus;
  lastUpdated: string;
  size: string;
  owner: string;
}

export interface AuditorDocumentsWorkspace {
  summary: {
    totalDocuments: number;
    current: number;
    needsReview: number;
  };
  documents: AuditorDocumentRecord[];
}

export interface AuditorReportRow {
  id: string;
  report: string;
  status: 'Up to date' | 'Review req.' | 'Preset: CDPH' | 'Packet';
  generated: string;
  format: string;
  category: 'Compliance' | 'Qualifications' | 'Clinical' | 'Regulatory';
}

export interface AuditorReportCard {
  id: string;
  title: string;
  detail: string;
  badge?: string;
  tone: AuditorTone;
  primaryAction: string;
  secondaryAction: string;
}

export interface AuditorReportsWorkspace {
  cards: AuditorReportCard[];
  exportHistory: AuditorReportRow[];
}

export interface AuditorAuditEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  status: AuditorEventStatus;
  details: string;
  target: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface AuditorSettingsPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  group: 'notifications' | 'exports';
}

export interface AuditorSettingsWorkspace {
  preferences: AuditorSettingsPreference[];
  accountActions: string[];
}

export interface AuditorRegulatorAccessSnapshot {
  regulator: string;
  accessMode: 'Read Only';
  transcriptExportsReady: number;
  auditPacketsReady: number;
  evidenceBundlesReady: number;
  lastAccessReview: string;
}

export interface AuditorPortalState {
  profile: AuditorProfile;
  dashboard: AuditorDashboardSnapshot;
  studentRecords: AuditorStudentRecordsWorkspace;
  instructorQualifications: AuditorInstructorQualificationsWorkspace;
  clinicalCompliance: AuditorClinicalComplianceWorkspace;
  programRequirements: AuditorProgramRequirementsWorkspace;
  documents: AuditorDocumentsWorkspace;
  reports: AuditorReportsWorkspace;
  settings: AuditorSettingsWorkspace;
  regulatorAccess: AuditorRegulatorAccessSnapshot;
  auditTrail: AuditorAuditEvent[];
}

export interface UpdateAuditorProfileDto {
  phone?: string;
  location?: string;
}

export interface SelectAuditorStudentDto {
  studentId: string;
}

export interface AddAuditorStudentNoteDto {
  note: string;
}

export interface VerifyAuditorStudentRecordDto {
  status: AuditorStudentStatus;
  certificationEligibility?: 'Eligible' | 'Blocked' | 'Pending Review';
  note?: string;
}

export interface SelectAuditorInstructorDto {
  instructorId: string;
}

export interface ReviewAuditorInstructorDto {
  status: AuditorInstructorStatus;
  note?: string;
}

export interface ResolveAuditorClinicalItemDto {
  status: AuditorComplianceStatus;
  actionRequired?: string;
}

export interface SelectAuditorProgramDto {
  programId: string;
}

export interface UploadAuditorDocumentDto {
  title: string;
  type: 'Spreadsheet' | 'PDF' | 'Archive' | 'Transcript' | 'Bundle';
  category: 'Attendance' | 'Clinical' | 'Instructor' | 'Policy' | 'Regulatory';
  size: string;
  owner: string;
  status?: AuditorDocumentStatus;
}

export interface UpdateAuditorDocumentStatusDto {
  status: AuditorDocumentStatus;
}

export interface GenerateAuditorReportExportDto {
  reportId: string;
  format: string;
}

export interface UpdateAuditorSettingDto {
  preferenceId: string;
  enabled: boolean;
}
