'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { DocumentRequirementsContent } from '@/components/admin/documents/document-requirements-content';
import { EntranceExamConfigContent } from '@/components/admin/onboarding/entrance-exam-content';
import { EnrollmentWizardConfigContent } from '@/components/admin/onboarding/enrollment-wizard-content';
import { OrientationSurveyConfigContent } from '@/components/admin/onboarding/orientation-survey-content';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'entrance-exam', label: 'Entrance Exam' },
  { id: 'enrollment-wizard', label: 'Enrollment Wizard' },
  { id: 'orientation-survey', label: 'Orientation Survey' },
  { id: 'documents', label: 'Document Requirements' },
];

function OnboardingConfigsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = React.useState('entrance-exam');

  React.useEffect(() => {
    const tab = searchParams.get('tab') || 'entrance-exam';
    setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`?tab=${tabId}`, { scroll: false } as any);
  };

  return (
    <AdminShell
      title="Onboarding Configurations"
      subtitle="Manage entrance exam, enrollment wizard, and orientation survey settings"
    >
      <div className="space-y-6">
        <div className="flex gap-8 border-b border-border-subtle">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  'px-3 py-4 font-semibold text-sm transition border-b-2 rounded-t-lg',
                  activeTab === tab.id
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-high/50',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

        <div className="pt-2">
          {activeTab === 'entrance-exam' && <EntranceExamConfigContent />}

          {activeTab === 'enrollment-wizard' && <EnrollmentWizardConfigContent />}

          {activeTab === 'orientation-survey' && <OrientationSurveyConfigContent />}

          {activeTab === 'documents' && <DocumentRequirementsContent />}
        </div>
      </div>
    </AdminShell>
  );
}

export default function OnboardingConfigsPage() {
  return (
    <Suspense
      fallback={
        <AdminShell title="Onboarding Configurations" subtitle="Loading configuration workspace...">
          <div className="p-8 text-center">Loading configuration workspace...</div>
        </AdminShell>
      }
    >
      <OnboardingConfigsContent />
    </Suspense>
  );
}
