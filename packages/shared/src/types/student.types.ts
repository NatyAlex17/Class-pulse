export interface Student {
  id: string;
  userId: string;
  studentNumber?: string;
  enrollmentDate?: string;
  status?: string;
  metadata?: Record<string, any>;
}
