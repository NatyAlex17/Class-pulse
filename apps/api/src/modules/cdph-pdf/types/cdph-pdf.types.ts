export interface CdphE276ModuleRow {
  title: string;
  theoryHours: number;
  clinicalHours: number;
}

export interface CdphE276PdfData {
  providerName: string;
  mailingAddress: string;
  county: string;
  phoneNumber: string;
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  providerType: string;
  applicationType: string;
  programType: string;
  providerLandingPageUrl: string;
  learningManagementSystemUrl: string;
  programLength: string;
  curriculumNameEditionYear: string;
  studentFees: string;
  modules: CdphE276ModuleRow[];
}

export interface CdphE276CTopicRow {
  topicId: string;
  label: string;
  hours: number | null;
  date: string | null;
  instructorInitials: string | null;
  testScore: number | null;
}

export interface CdphE276CModuleRow {
  moduleTitle: string;
  topics: CdphE276CTopicRow[];
}

export interface CdphE276CPdfData {
  studentName: string;
  ssn: string;
  startDate: string;
  completionDate: string;
  instructorName: string;
  finalGrade: string;
  modules: CdphE276CModuleRow[];
}

export interface CdphE276ASkillRow {
  skillId: string;
  label: string;
  status: 'S' | 'U' | null;
  comments: string | null;
  datePerformed: string | null;
  instructorInitials: string | null;
}

export interface CdphE276AModuleRow {
  moduleTitle: string;
  clinicalHours: number;
  items: CdphE276ASkillRow[];
}

export interface CdphE276APdfData {
  studentName: string;
  ssn: string;
  instructorName: string;
  trainingProgramName: string;
  clinicalSiteName: string;
  startDate: string;
  completionDate: string;
  modules: CdphE276AModuleRow[];
}

export interface Cdph283BPdfData {
  requestType: 'enrollment' | 'reconsideration';
  lastName: string;
  firstName: string;
  dob: string;
  ssn: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  conviction: boolean;
  convictionDetails: string;
  trainingProgramName: string;
  signedAt: string | null;
}
