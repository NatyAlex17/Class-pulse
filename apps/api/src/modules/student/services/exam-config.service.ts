import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';

import { ConfigStoreService } from '../../../common/services/config-store.service';
import type { EntranceExamQuestionDefinition } from '../types/student-portal.types';
import { defaultEntranceExamConfig } from '../data/student-portal.seed';

export interface EntranceExamConfig {
  intro: string;
  passingScore: number;
  questions: EntranceExamQuestionDefinition[];
}

const CONFIG_KEY = 'exam-config';
const LEGACY_CONFIG_FILE = 'exam-config.json';

@Injectable()
export class ExamConfigService implements OnModuleInit {
  private config: EntranceExamConfig = defaultEntranceExamConfig;

  constructor(private readonly configStore: ConfigStoreService) {}

  async onModuleInit() {
    await this.loadConfig();
  }

  private async loadConfig() {
    try {
      const stored = await this.configStore.load<EntranceExamConfig>(CONFIG_KEY, LEGACY_CONFIG_FILE);
      if (stored) {
        this.config = this.validateConfig(stored);
        return;
      }
      this.config = defaultEntranceExamConfig;
      this.persistConfig();
    } catch (error) {
      console.error('Error loading exam config:', error);
      this.config = defaultEntranceExamConfig;
    }
  }

  private persistConfig() {
    void this.configStore.set(CONFIG_KEY, this.config);
  }

  getConfig(): EntranceExamConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  updateConfig(newConfig: EntranceExamConfig): EntranceExamConfig {
    this.config = this.validateConfig(newConfig);
    this.persistConfig();
    return this.getConfig();
  }

  resetToDefault(): EntranceExamConfig {
    this.config = JSON.parse(JSON.stringify(defaultEntranceExamConfig));
    this.persistConfig();
    return this.getConfig();
  }

  private validateConfig(config: EntranceExamConfig): EntranceExamConfig {
    const intro = config.intro?.trim();
    const questions = config.questions.map((question) => ({
      ...question,
      id: question.id.trim(),
      prompt: question.prompt.trim(),
      placeholder: question.placeholder?.trim(),
      preferredAnswer: question.preferredAnswer.trim(),
      options: question.options.map((option) => ({
        ...option,
        label: option.label.trim(),
        value: option.value.trim(),
      })),
    }));

    if (!intro) {
      throw new BadRequestException('Entrance exam intro is required.');
    }

    if (questions.length === 0) {
      throw new BadRequestException('At least one entrance exam question is required.');
    }

    questions.forEach((question, index) => {
      if (!question.id || !question.prompt || !question.preferredAnswer) {
        throw new BadRequestException(`Question ${index + 1} is missing an id, prompt, or preferred answer.`);
      }

      if (question.type === 'choice') {
        if (question.options.length < 2) {
          throw new BadRequestException(`Choice question ${question.id} must include at least two options.`);
        }

        const optionValues = new Set(question.options.map((option) => option.value));
        if (!optionValues.has(question.preferredAnswer)) {
          throw new BadRequestException(`Choice question ${question.id} must use one of its option values as the preferred answer.`);
        }
      }
    });

    if (!Number.isInteger(config.passingScore) || config.passingScore < 1 || config.passingScore > questions.length) {
      throw new BadRequestException('Passing score must be a whole number between 1 and the total number of questions.');
    }

    return {
      intro,
      passingScore: config.passingScore,
      questions,
    };
  }
}
