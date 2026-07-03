import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import type {
  ExamQuestionDefinition,
  LearningModuleDefinition,
  LearningResourceDefinition,
  LearningSectionDefinition,
} from '../types/student-portal.types';

export interface LearningResourcesConfig {
  modules: LearningModuleDefinition[];
  globalSettings?: {
    minimumHoursForCertification?: number;
  };
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

const DATA_DIR = path.join(process.cwd(), 'apps/api/.data');
const CONFIG_FILE = path.join(DATA_DIR, 'learning-resources-config.json');

@Injectable()
export class LearningResourcesConfigService implements OnModuleInit {
  private config: LearningResourcesConfig = JSON.parse(JSON.stringify(defaultLearningResourcesConfig));

  onModuleInit() {
    this.loadConfig();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadConfig() {
    try {
      this.ensureDataDir();
      if (fs.existsSync(CONFIG_FILE)) {
        const fileContent = fs.readFileSync(CONFIG_FILE, 'utf-8');
        const loadedConfig = JSON.parse(fileContent);
        this.config = this.validateConfig(loadedConfig);
      } else {
        this.config = JSON.parse(JSON.stringify(defaultLearningResourcesConfig));
        this.persistConfig();
      }
    } catch (error) {
      console.error('Error loading learning resources config:', error);
      this.config = JSON.parse(JSON.stringify(defaultLearningResourcesConfig));
    }
  }

  private persistConfig() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error persisting learning resources config:', error);
    }
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
      order: Number(module.order ?? 0),
      minimumHoursForCertification:
        module.minimumHoursForCertification === undefined || module.minimumHoursForCertification === null
          ? undefined
          : Number(module.minimumHoursForCertification),
      sections: (module.sections ?? []).map((section) => this.normalizeSection(section)),
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
}
