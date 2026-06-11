export interface ComplianceRecord {
  id: string;
  subjectId: string; // e.g., instructor or student id
  type: string; // credential, document, training
  status: string; // e.g., valid, expired, pending
  issuedAt?: string;
  expiresAt?: string;
  details?: Record<string, any>;
}
