import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';

import { ConfigStoreService } from '../../../common/services/config-store.service';

export interface InstructorOnboardingQuestionOption {
  label: string;
  value: string;
}

export interface InstructorOnboardingQuestionDefinition {
  id: string;
  prompt: string;
  type: 'choice' | 'text';
  placeholder?: string;
  preferredAnswer: string;
  options: InstructorOnboardingQuestionOption[];
}

export interface InstructorOnboardingQuestionsConfig {
  questions: InstructorOnboardingQuestionDefinition[];
}

const CONFIG_KEY = 'instructor-onboarding-questions-config';
const LEGACY_CONFIG_FILE = 'instructor-onboarding-questions-config.json';

const defaultInstructorOnboardingQuestionsConfig: InstructorOnboardingQuestionsConfig = {
  questions: [
    {
      id: 'q1',
      prompt: 'Describe your clinical teaching experience and the settings you have worked in.',
      type: 'text',
      placeholder: 'Write your response...',
      preferredAnswer: 'Reviewer looks for hands-on clinical teaching experience relevant to the program.',
      options: [],
    },
    {
      id: 'q2',
      prompt: 'What is your approach to mentoring students who are struggling with a clinical skill?',
      type: 'text',
      placeholder: 'Write your response...',
      preferredAnswer: 'Reviewer looks for a structured, patient mentoring approach.',
      options: [],
    },
    {
      id: 'q3',
      prompt: 'Do you have any scheduling constraints or availability limitations we should know about?',
      type: 'text',
      placeholder: 'Write your response...',
      preferredAnswer: 'Reviewer notes any constraints for scheduling purposes.',
      options: [],
    },
  ],
};

@Injectable()
export class InstructorOnboardingQuestionsConfigService implements OnModuleInit {
  private config: InstructorOnboardingQuestionsConfig = defaultInstructorOnboardingQuestionsConfig;

  constructor(private readonly configStore: ConfigStoreService) {}

  async onModuleInit() {
    await this.loadConfig();
  }

  getConfig(): InstructorOnboardingQuestionsConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  updateConfig(newConfig: InstructorOnboardingQuestionsConfig): InstructorOnboardingQuestionsConfig {
    this.config = this.validateConfig(newConfig);
    this.persistConfig();
    return this.getConfig();
  }

  resetToDefault(): InstructorOnboardingQuestionsConfig {
    this.config = JSON.parse(JSON.stringify(defaultInstructorOnboardingQuestionsConfig));
    this.persistConfig();
    return this.getConfig();
  }

  private validateConfig(config: InstructorOnboardingQuestionsConfig): InstructorOnboardingQuestionsConfig {
    if (!config || !Array.isArray(config.questions)) {
      throw new BadRequestException(
        'Instructor onboarding questions configuration must contain a "questions" array.',
      );
    }

    if (config.questions.length === 0) {
      throw new BadRequestException('At least one instructor onboarding question is required.');
    }

    const seenIds = new Set<string>();
    const questions = config.questions.map((question, index) => {
      const id = String(question.id ?? '').trim();
      const prompt = String(question.prompt ?? '').trim();
      const type: 'choice' | 'text' = question.type === 'choice' ? 'choice' : 'text';
      const placeholder = question.placeholder?.trim();
      const preferredAnswer = String(question.preferredAnswer ?? '').trim();
      const options = (question.options ?? []).map((option) => ({
        label: String(option.label ?? '').trim(),
        value: String(option.value ?? '').trim(),
      }));

      if (!id || !prompt || !preferredAnswer) {
        throw new BadRequestException(`Question ${index + 1} is missing an id, prompt, or preferred answer.`);
      }

      if (seenIds.has(id)) {
        throw new BadRequestException(`Duplicate question id "${id}".`);
      }
      seenIds.add(id);

      if (type === 'choice') {
        if (options.length < 2) {
          throw new BadRequestException(`Choice question "${id}" must include at least two options.`);
        }

        const optionValues = new Set(options.map((option) => option.value));
        if (!optionValues.has(preferredAnswer)) {
          throw new BadRequestException(`Choice question "${id}" must use one of its option values as the preferred answer.`);
        }
      }

      return { id, prompt, type, placeholder, preferredAnswer, options };
    });

    return { questions };
  }

  private async loadConfig() {
    try {
      const stored = await this.configStore.load<InstructorOnboardingQuestionsConfig>(
        CONFIG_KEY,
        LEGACY_CONFIG_FILE,
      );
      if (stored) {
        this.config = this.validateConfig(stored);
        return;
      }
      this.config = defaultInstructorOnboardingQuestionsConfig;
      this.persistConfig();
    } catch (error) {
      console.error('Error loading instructor onboarding questions config:', error);
      this.config = defaultInstructorOnboardingQuestionsConfig;
    }
  }

  private persistConfig() {
    void this.configStore.set(CONFIG_KEY, this.config);
  }
}
