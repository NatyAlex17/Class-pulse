'use client';

import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';

import { AdminShell } from '@/components/admin/admin-shell';
import { Button } from '@/components/ui/button';

import { ModuleDetailView } from './learning-resources/module-detail-view';
import { ModulesView } from './learning-resources/modules-view';
import { SectionDetailView } from './learning-resources/section-detail-view';
import { ConfigBanner, PageToolbar } from './learning-resources/shared';
import type { BuilderView } from './learning-resources/types';
import { useLearningResourcesConfig } from './learning-resources/use-learning-resources-config';

type BuilderProps = {
  view: BuilderView;
  moduleId?: string;
  sectionId?: string;
};

export function LearningResourcesConfigBuilder({ view, moduleId, sectionId }: BuilderProps) {
  const store = useLearningResourcesConfig();
  const { config, loading, saving, resetting, error, success, fetchConfig, saveConfig, resetConfig } = store;

  const selectedModule = config?.modules.find((module) => module.id === moduleId) ?? null;
  const selectedSection = selectedModule?.sections.find((section) => section.id === sectionId) ?? null;

  if (loading) {
    return (
      <AdminShell title="Learning Management Config" subtitle="Loading module and section configuration.">
        <div className="p-8 text-center">Loading learning management configuration...</div>
      </AdminShell>
    );
  }

  if (!config) {
    return (
      <AdminShell
        title="Learning Management Config"
        subtitle="Module and section authoring."
        topActions={
          <PageToolbar
            onRefresh={() => void fetchConfig()}
            onReset={() => void resetConfig()}
            onSave={() => void saveConfig()}
            resetting={resetting}
            saving={saving}
          />
        }
      >
        <ConfigBanner error={error} success={success} />
      </AdminShell>
    );
  }

  if (view === 'module-detail' && !selectedModule) {
    return (
      <AdminShell title="Module Not Found" subtitle="Return to the module list to choose another module.">
        <Link href="/admin/configurations/learning-resources">
          <Button variant="secondary">
            <IconArrowLeft className="size-4" />
            Back to Modules
          </Button>
        </Link>
      </AdminShell>
    );
  }

  if (view === 'section-detail' && (!selectedModule || !selectedSection)) {
    return (
      <AdminShell title="Section Not Found" subtitle="Return to the module list to choose another section.">
        <Link href="/admin/configurations/learning-resources">
          <Button variant="secondary">
            <IconArrowLeft className="size-4" />
            Back to Modules
          </Button>
        </Link>
      </AdminShell>
    );
  }

  if (view === 'modules') {
    return <ModulesView store={store} />;
  }

  if (view === 'module-detail') {
    return <ModuleDetailView store={store} moduleId={moduleId} />;
  }

  if (view === 'section-detail') {
    return <SectionDetailView store={store} moduleId={moduleId} sectionId={sectionId} />;
  }

  return null;
}
