import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';

import { ConfigStoreService } from '../../../common/services/config-store.service';
import type {
  ExamQuestionDefinition,
  LearningModuleDefinition,
  LearningResourceDefinition,
  LearningSectionDefinition,
  ModuleSkillDefinition,
} from '../types/student-portal.types';

export interface LearningResourcesConfig {
  modules: LearningModuleDefinition[];
  globalSettings?: {
    minimumHoursForCertification?: number;
  };
}

export interface LearningResourcesImportSummary {
  modules: number;
  sections: number;
  resources: number;
}

const defaultLearningResourcesConfig: LearningResourcesConfig = {
  modules: [],
  globalSettings: {
    minimumHoursForCertification: 0,
  },
};

const supportedResourceTypes = ['video', 'pdf', 'link', 'text', 'exam'] as const;
const urlRequiredTypes = new Set(['video', 'pdf', 'link']);
const contentFriendlyTypes = new Set(['text', 'exam']);
const importRequiredHeaders = [
  'module_id',
  'module_title',
  'module_summary',
  'module_required_hours',
  'module_fee',
  'module_order',
  'section_id',
  'section_title',
  'resource_id',
  'resource_title',
  'resource_type',
  'resource_duration',
] as const;

const CONFIG_KEY = 'learning-resources-config';
const LEGACY_CONFIG_FILE = 'learning-resources-config.json';

@Injectable()
export class LearningResourcesConfigService implements OnModuleInit {
  private config: LearningResourcesConfig = JSON.parse(JSON.stringify(defaultLearningResourcesConfig));

  constructor(private readonly configStore: ConfigStoreService) {}

  async onModuleInit() {
    await this.loadConfig();
  }

  private async loadConfig() {
    try {
      const stored = await this.configStore.load<LearningResourcesConfig>(CONFIG_KEY, LEGACY_CONFIG_FILE);
      if (stored) {
        this.config = this.validateConfig(stored);
        return;
      }
      this.config = JSON.parse(JSON.stringify(defaultLearningResourcesConfig));
      this.persistConfig();
    } catch (error) {
      console.error('Error loading learning resources config:', error);
      this.config = JSON.parse(JSON.stringify(defaultLearningResourcesConfig));
    }
  }

  private persistConfig() {
    void this.configStore.set(CONFIG_KEY, this.config);
  }

  getConfig(): LearningResourcesConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  updateConfig(newConfig: LearningResourcesConfig): LearningResourcesConfig {
    this.config = this.validateConfig(newConfig);
    this.persistConfig();
    return this.getConfig();
  }

  resetToDefault(): LearningResourcesConfig {
    this.config = JSON.parse(JSON.stringify(defaultLearningResourcesConfig));
    this.persistConfig();
    return this.getConfig();
  }

  importFromCsvContent(content: string): {
    config: LearningResourcesConfig;
    summary: LearningResourcesImportSummary;
  } {
    const rows = this.parseDelimitedContent(content);

    if (rows.length === 0) {
      throw new BadRequestException('The import file is empty.');
    }

    const headers = rows[0].map((value) => value.trim());
    const missingHeaders = importRequiredHeaders.filter((header) => !headers.includes(header));

    if (missingHeaders.length > 0) {
      throw new BadRequestException(`The import file is missing required columns: ${missingHeaders.join(', ')}.`);
    }

    const modules = new Map<
      string,
      LearningModuleDefinition & { sectionMap: Map<string, LearningSectionDefinition> }
    >();

    rows.slice(1).forEach((row, rowIndex) => {
      const csvRowNumber = rowIndex + 2;
      const record = this.toRecord(headers, row);

      if (Object.values(record).every((value) => value.trim() === '')) {
        return;
      }

      const moduleId = record.module_id.trim();
      const sectionId = record.section_id.trim();
      const resourceId = record.resource_id.trim();

      if (!moduleId || !sectionId || !resourceId) {
        throw new BadRequestException(
          `Row ${csvRowNumber} must include module_id, section_id, and resource_id.`,
        );
      }

      const moduleTitle = record.module_title.trim();
      const moduleSummary = record.module_summary.trim();
      const requiredHours = Number(record.module_required_hours);
      const moduleFee = Number(record.module_fee);
      const moduleOrder = Number(record.module_order);
      const minimumHoursForCertification = this.parseOptionalNumber(record.minimum_hours_for_certification);
      const minimumClinicalHours = this.parseOptionalNumber(record.minimum_clinical_hours);
      const skills = this.parseSkills(record.skill_names);

      if (!moduleTitle || !moduleSummary) {
        throw new BadRequestException(`Row ${csvRowNumber} must include module_title and module_summary.`);
      }

      if (!Number.isFinite(requiredHours) || requiredHours <= 0) {
        throw new BadRequestException(`Row ${csvRowNumber} must include module_required_hours greater than zero.`);
      }

      if (!Number.isFinite(moduleFee) || moduleFee < 0) {
        throw new BadRequestException(`Row ${csvRowNumber} must include a valid module_fee.`);
      }

      if (!Number.isFinite(moduleOrder)) {
        throw new BadRequestException(`Row ${csvRowNumber} must include a valid module_order.`);
      }

      let moduleEntry = modules.get(moduleId);
      if (!moduleEntry) {
        moduleEntry = {
          id: moduleId,
          title: moduleTitle,
          summary: moduleSummary,
          requiredHours,
          moduleFee,
          order: moduleOrder,
          minimumHoursForCertification,
          minimumClinicalHours,
          skills,
          sections: [],
          sectionMap: new Map<string, LearningSectionDefinition>(),
        };
        modules.set(moduleId, moduleEntry);
      } else {
        this.assertConsistentModuleRow(moduleEntry, {
          title: moduleTitle,
          summary: moduleSummary,
          requiredHours,
          moduleFee,
          order: moduleOrder,
          minimumHoursForCertification,
          minimumClinicalHours,
        }, csvRowNumber);
      }

      const sectionTitle = (record.section_title ?? '').trim();
      const sectionDescription = (record.section_description ?? '').trim();

      if (!sectionTitle) {
        throw new BadRequestException(`Row ${csvRowNumber} must include section_title.`);
      }

      let sectionEntry = moduleEntry.sectionMap.get(sectionId);
      if (!sectionEntry) {
        sectionEntry = {
          id: sectionId,
          title: sectionTitle,
          description: sectionDescription,
          resources: [],
        };
        moduleEntry.sectionMap.set(sectionId, sectionEntry);
        moduleEntry.sections.push(sectionEntry);
      } else if (sectionEntry.title !== sectionTitle || sectionEntry.description !== sectionDescription) {
        throw new BadRequestException(
          `Row ${csvRowNumber} has conflicting section metadata for section "${sectionId}".`,
        );
      }

      const resourceType = (record.resource_type ?? '').trim() as LearningResourceDefinition['type'];
      const resourceTitle = (record.resource_title ?? '').trim();
      const resourceDuration = (record.resource_duration ?? '').trim();
      const resourceDescription = (record.resource_description ?? '').trim();
      const resourceContent = (record.resource_content ?? '').trim();
      const resourceUrl = (record.resource_url ?? '').trim();
      const questionCount = this.parseOptionalNumber(record.resource_question_count);
      const passingScore = this.parseOptionalNumber(record.resource_passing_score);

      if (!resourceTitle || !resourceDuration) {
        throw new BadRequestException(`Row ${csvRowNumber} must include resource_title and resource_duration.`);
      }

      if (sectionEntry.resources.some((resource) => resource.id === resourceId)) {
        throw new BadRequestException(
          `Row ${csvRowNumber} duplicates resource_id "${resourceId}" within section "${sectionId}".`,
        );
      }

      sectionEntry.resources.push({
        id: resourceId,
        title: resourceTitle,
        type: resourceType,
        duration: resourceDuration,
        description: resourceDescription,
        content: resourceContent || undefined,
        url: resourceUrl || undefined,
        questionCount: questionCount ?? undefined,
        passingScore: passingScore ?? undefined,
      });
    });

    const nextConfig = this.updateConfig({
      modules: Array.from(modules.values())
        .map(({ sectionMap: _sectionMap, ...module }) => module)
        .sort((left, right) => left.order - right.order),
      globalSettings: this.config.globalSettings,
    });

    return {
      config: nextConfig,
      summary: {
        modules: nextConfig.modules.length,
        sections: nextConfig.modules.reduce((sum, module) => sum + module.sections.length, 0),
        resources: nextConfig.modules.reduce(
          (sum, module) => sum + module.sections.reduce((sectionSum, section) => sectionSum + section.resources.length, 0),
          0,
        ),
      },
    };
  }

  private validateConfig(config: LearningResourcesConfig): LearningResourcesConfig {
    // Empty configs and partially-built modules/sections are allowed so admins
    // can author incrementally (module first, then sections, then items).
    const modules = (config.modules ?? []).map((module) => this.normalizeModule(module));

    const moduleIds = new Set<string>();

    modules.forEach((module, moduleIndex) => {
      if (!module.id || !module.title || !module.summary) {
        throw new BadRequestException(`Module ${moduleIndex + 1} must include an id, title, and summary.`);
      }

      if (moduleIds.has(module.id)) {
        throw new BadRequestException(`Module id "${module.id}" must be unique.`);
      }
      moduleIds.add(module.id);

      if (!Number.isFinite(module.requiredHours) || module.requiredHours <= 0) {
        throw new BadRequestException(`Module "${module.title}" must include required hours greater than zero.`);
      }

      if (!Number.isFinite(module.moduleFee) || module.moduleFee < 0) {
        throw new BadRequestException(`Module "${module.title}" must include a module fee of zero or more.`);
      }

      if (!Number.isFinite(module.order)) {
        throw new BadRequestException(`Module "${module.title}" must include an order number.`);
      }

      if (
        module.minimumHoursForCertification !== undefined &&
        (!Number.isFinite(module.minimumHoursForCertification) || module.minimumHoursForCertification < 0)
      ) {
        throw new BadRequestException(
          `Module "${module.title}" minimum hours for certification must be a non-negative number.`,
        );
      }

      if (
        module.minimumClinicalHours !== undefined &&
        (!Number.isFinite(module.minimumClinicalHours) || module.minimumClinicalHours < 0)
      ) {
        throw new BadRequestException(
          `Module "${module.title}" minimum clinical hours must be a non-negative number.`,
        );
      }

      const skillIds = new Set<string>();
      (module.skills ?? []).forEach((skill, skillIndex) => {
        if (!skill.id || !skill.name) {
          throw new BadRequestException(
            `Skill ${skillIndex + 1} in module "${module.title}" must include an id and name.`,
          );
        }

        if (skillIds.has(skill.id)) {
          throw new BadRequestException(`Skill id "${skill.id}" in module "${module.title}" must be unique.`);
        }
        skillIds.add(skill.id);
      });

      const sectionIds = new Set<string>();
      const resourceIds = new Set<string>();

      module.sections.forEach((section, sectionIndex) => {
        if (!section.id || !section.title) {
          throw new BadRequestException(
            `Section ${sectionIndex + 1} in module "${module.title}" must include an id and title.`,
          );
        }

        if (sectionIds.has(section.id)) {
          throw new BadRequestException(`Section id "${section.id}" in module "${module.title}" must be unique.`);
        }
        sectionIds.add(section.id);

        section.resources.forEach((resource) => {
          if (resourceIds.has(resource.id)) {
            throw new BadRequestException(
              `Resource id "${resource.id}" must be unique within module "${module.title}".`,
            );
          }
          resourceIds.add(resource.id);
        });
      });
    });

    const globalSettings = config.globalSettings
      ? {
          minimumHoursForCertification:
            config.globalSettings.minimumHoursForCertification === undefined ||
            config.globalSettings.minimumHoursForCertification === null
              ? undefined
              : Number(config.globalSettings.minimumHoursForCertification),
        }
      : undefined;

    return { modules, globalSettings };
  }

  private normalizeModule(module: LearningModuleDefinition): LearningModuleDefinition {
    return {
      id: (module.id ?? '').trim(),
      title: (module.title ?? '').trim(),
      summary: (module.summary ?? '').trim(),
      requiredHours: Number(module.requiredHours),
      moduleFee: Number(module.moduleFee ?? 0),
      order: Number(module.order ?? 0),
      minimumHoursForCertification:
        module.minimumHoursForCertification === undefined || module.minimumHoursForCertification === null
          ? undefined
          : Number(module.minimumHoursForCertification),
      minimumClinicalHours:
        module.minimumClinicalHours === undefined || module.minimumClinicalHours === null
          ? undefined
          : Number(module.minimumClinicalHours),
      skills: (module.skills ?? []).map((skill) => this.normalizeSkill(skill)),
      sections: (module.sections ?? []).map((section) => this.normalizeSection(section)),
    };
  }

  private normalizeSkill(skill: ModuleSkillDefinition): ModuleSkillDefinition {
    return {
      id: (skill.id ?? '').trim(),
      name: (skill.name ?? '').trim(),
    };
  }

  private normalizeSection(section: LearningSectionDefinition): LearningSectionDefinition {
    return {
      id: (section.id ?? '').trim(),
      title: (section.title ?? '').trim(),
      description: (section.description ?? '').trim(),
      resources: (section.resources ?? []).map((resource) => this.normalizeResource(resource)),
    };
  }

  private normalizeResource(resource: LearningResourceDefinition): LearningResourceDefinition {
    const normalized: LearningResourceDefinition = {
      ...resource,
      id: (resource.id ?? '').trim(),
      title: (resource.title ?? '').trim(),
      type: resource.type,
      duration: (resource.duration ?? '').trim(),
      description: (resource.description ?? '').trim(),
      url: resource.url?.trim() || undefined,
      content: resource.content?.trim() || undefined,
      questionCount:
        resource.questionCount === undefined || resource.questionCount === null
          ? undefined
          : Number(resource.questionCount),
      passingScore:
        resource.passingScore === undefined || resource.passingScore === null
          ? undefined
          : Number(resource.passingScore),
    };

    if (!normalized.id || !normalized.title || !normalized.duration) {
      throw new BadRequestException('Each learning resource must include an id, title, and duration.');
    }

    if (!supportedResourceTypes.includes(normalized.type)) {
      throw new BadRequestException(`Learning resource "${normalized.title}" has an unsupported type.`);
    }

    // Only links hard-require a URL; video/pdf items can be drafted first and
    // have their media URL attached later from the item editor.
    if (normalized.type === 'link' && !normalized.url) {
      throw new BadRequestException(`Learning resource "${normalized.title}" must include a URL.`);
    }

    if (!urlRequiredTypes.has(normalized.type)) {
      normalized.url = undefined;
    }

    if (contentFriendlyTypes.has(normalized.type) && !normalized.content && !normalized.description) {
      throw new BadRequestException(
        `Learning resource "${normalized.title}" must include content or a description.`,
      );
    }

    if (normalized.type === 'exam') {
      // Questions are normalized leniently: the admin builder auto-saves while
      // questions are still being written, so incomplete entries are kept as-is
      // instead of rejected. The builder enforces completeness on item creation.
      const questions = this.normalizeExamQuestions(resource);
      normalized.questions = questions.length > 0 ? questions : undefined;

      if (questions.length > 0) {
        normalized.questionCount = questions.length;
      }

      if (!normalized.questionCount || normalized.questionCount <= 0) {
        throw new BadRequestException(`Exam "${normalized.title}" must include a question count greater than zero.`);
      }

      if (
        normalized.passingScore !== undefined &&
        (!Number.isFinite(normalized.passingScore) || normalized.passingScore < 0 || normalized.passingScore > 100)
      ) {
        throw new BadRequestException(`Exam "${normalized.title}" must include a passing score between 0 and 100.`);
      }
    } else {
      normalized.questionCount = undefined;
      normalized.passingScore = undefined;
      normalized.questions = undefined;
    }

    return normalized;
  }

  private normalizeExamQuestions(resource: LearningResourceDefinition): ExamQuestionDefinition[] {
    const isMultipleChoice = resource.examFormat === 'multiple-choice';

    return (resource.questions ?? []).map((question, index) => {
      const points = Number(question.points);
      // Option positions are preserved (empty entries included) so that
      // correctOption indexes stay valid while the admin is still editing.
      const options = isMultipleChoice
        ? (question.options ?? []).map((option) => (option ?? '').trim())
        : undefined;
      const correctOptionRaw = Number(question.correctOption);
      const correctOption =
        options !== undefined &&
        Number.isInteger(correctOptionRaw) &&
        correctOptionRaw >= 0 &&
        correctOptionRaw < options.length
          ? correctOptionRaw
          : undefined;

      return {
        id: (question.id ?? '').trim() || `q${index + 1}`,
        prompt: (question.prompt ?? '').trim(),
        points: Number.isFinite(points) && points > 0 ? points : 1,
        expectedAnswer: question.expectedAnswer?.trim() || undefined,
        options,
        correctOption,
      };
    });
  }

  private parseOptionalNumber(value: string | undefined) {
    const trimmedValue = value?.trim();

    if (!trimmedValue) {
      return undefined;
    }

    const parsed = Number(trimmedValue);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private parseSkills(value: string | undefined): ModuleSkillDefinition[] {
    const trimmedValue = value?.trim();

    if (!trimmedValue) {
      return [];
    }

    return Array.from(new Set(trimmedValue.split('|').map((item) => item.trim()).filter(Boolean))).map((name) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `skill-${Date.now()}`,
      name,
    }));
  }

  private assertConsistentModuleRow(
    module: LearningModuleDefinition,
    incoming: {
      title: string;
      summary: string;
      requiredHours: number;
      moduleFee: number;
      order: number;
      minimumHoursForCertification?: number;
      minimumClinicalHours?: number;
    },
    rowNumber: number,
  ) {
    if (
      module.title !== incoming.title ||
      module.summary !== incoming.summary ||
      module.requiredHours !== incoming.requiredHours ||
      module.moduleFee !== incoming.moduleFee ||
      module.order !== incoming.order ||
      module.minimumHoursForCertification !== incoming.minimumHoursForCertification ||
      module.minimumClinicalHours !== incoming.minimumClinicalHours
    ) {
      throw new BadRequestException(`Row ${rowNumber} has conflicting module metadata for "${module.id}".`);
    }
  }

  private toRecord(headers: string[], row: string[]) {
    return headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = row[index] ?? '';
      return record;
    }, {});
  }

  private parseDelimitedContent(content: string): string[][] {
    const normalizedContent = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
    const rows: string[][] = [];
    let currentField = '';
    let currentRow: string[] = [];
    let inQuotes = false;

    for (let index = 0; index < normalizedContent.length; index += 1) {
      const character = normalizedContent[index];
      const nextCharacter = normalizedContent[index + 1];

      if (character === '"') {
        if (inQuotes && nextCharacter === '"') {
          currentField += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (character === ',' && !inQuotes) {
        currentRow.push(currentField);
        currentField = '';
        continue;
      }

      if (character === '\n' && !inQuotes) {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentField = '';
        currentRow = [];
        continue;
      }

      currentField += character;
    }

    currentRow.push(currentField);
    rows.push(currentRow);

    return rows.filter((row) => row.some((field) => field.length > 0));
  }
}
