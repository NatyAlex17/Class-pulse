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

export type CdphSex = 'Male' | 'Female' | '';

export interface Cdph283BPdfData {
  // Section I
  requestType: 'enrollment' | 'reconsideration';

  // Section II
  lastName: string;
  firstName: string;
  middleInitial: string;
  sex: CdphSex;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  confidentialAddressLine1: string;
  confidentialCity: string;
  confidentialState: string;
  confidentialZip: string;
  dob: string;
  ssn: string;
  itin: string;
  driversLicenseNumber: string;
  driversLicenseState: string;
  phone: string;
  email: string;
  textMessageConsent: boolean;

  // Section III
  conviction: boolean;
  convictionDescription: string;
  convictionCourt: string;
  convictionDate: string;
  adverseAction: boolean;
  adverseActionLicenseType: string;
  adverseActionLicenseNumber: string;
  adverseActionType: string;

  // Section IV
  trainingProgramName: string;
  trainingProgramPhone: string;
  trainingProgramAddressLine1: string;
  trainingProgramCity: string;
  trainingProgramState: string;
  trainingProgramZip: string;
  trainingProgramId: string;
  trainingBeginDate: string;
  trainingEndDate: string;

  // Section V
  signedAt: string | null;
}
