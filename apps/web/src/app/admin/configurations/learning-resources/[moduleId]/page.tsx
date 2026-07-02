import { LearningResourcesConfigBuilder } from '@/components/admin/learning-resources-config-builder';

export default async function LearningResourcesModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;

  return <LearningResourcesConfigBuilder view="module-detail" moduleId={moduleId} />;
}
