import { Suspense } from 'react';
import ApplicationsReviewWorkspace from '@/components/admin/applications-review-workspace';

export default function AdminApplicationsPage() {
  return (
    <Suspense fallback={null}>
      <ApplicationsReviewWorkspace />
    </Suspense>
  );
}
