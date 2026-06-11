export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  status: string;
  enrolledAt?: string;
  metadata?: Record<string, any>;
}
