import { LearningResourcesConfigBuilder } from '@/components/admin/learning-resources-config-builder';

export default async function LearningResourcesSectionPage({
  params,
}: {
  params: Promise<{ moduleId: string; sectionId: string }>;
}) {
  const { moduleId, sectionId } = await params;

  return (
    <LearningResourcesConfigBuilder
      view="section-detail"
      moduleId={moduleId}
      sectionId={sectionId}
    />
  );
}
