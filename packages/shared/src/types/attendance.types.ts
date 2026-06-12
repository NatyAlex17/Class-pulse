export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  status: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}
