import type { ReactNode } from 'react';
import { StudentDemoProvider } from '@/components/student/student-demo-store';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <StudentDemoProvider>{children}</StudentDemoProvider>;
}
