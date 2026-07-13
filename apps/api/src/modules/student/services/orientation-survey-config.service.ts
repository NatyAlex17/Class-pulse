import { Injectable, OnModuleInit } from '@nestjs/common';

import { ConfigStoreService } from '../../../common/services/config-store.service';

const CONFIG_KEY = 'orientation-survey-config';
const LEGACY_CONFIG_FILE = 'orientation-survey-config.json';

export interface SurveyQuestion {
  id: string;
  question: string;
  description?: string;
  type: 'text' | 'rating' | 'choice' | 'multiple-choice';
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  scale?: { min: number; max: number; minLabel?: string; maxLabel?: string };
}

export interface OrientationSurveyConfig {
  title: string;
  description: string;
  questions: SurveyQuestion[];
}

const defaultOrientationSurveyConfig: OrientationSurveyConfig = {
  title: 'Orientation Survey',
  description: 'Help us understand your onboarding experience',
  questions: [
    {
      id: 'q1',
      question: 'How clear was the orientation process?',
      type: 'rating',
      required: true,
      scale: { min: 1, max: 5, minLabel: 'Very Unclear', maxLabel: 'Very Clear' },
    },
    {
      id: 'q2',
      question: 'Did you feel prepared for your program?',
      type: 'choice',
      required: true,
      options: [
        { label: 'Yes, very prepared', value: 'very_prepared' },
        { label: 'Somewhat prepared', value: 'somewhat_prepared' },
        { label: 'Not very prepared', value: 'not_prepared' },
      ],
    },
    {
      id: 'q3',
      question: 'Which aspects helped you most?',
      type: 'multiple-choice',
      options: [
        { label: 'Welcome session', value: 'welcome' },
        { label: 'Portal walkthrough', value: 'portal' },
        { label: 'Resource materials', value: 'resources' },
        { label: 'Peer connections', value: 'peers' },
      ],
    },
    {
      id: 'q4',
      question: 'What could we improve?',
      type: 'text',
      description: 'Please share any suggestions for improvement',
    },
  ],
};

@Injectable()
export class OrientationSurveyConfigService implements OnModuleInit {
  private config: OrientationSurveyConfig = JSON.parse(
    JSON.stringify(defaultOrientationSurveyConfig),
  );

  constructor(private readonly configStore: ConfigStoreService) {}

  async onModuleInit() {
    await this.loadConfig();
  }

  private async loadConfig() {
    try {
      const stored = await this.configStore.load<OrientationSurveyConfig>(CONFIG_KEY, LEGACY_CONFIG_FILE);
      if (stored) {
        this.config = stored;
        return;
      }
      this.config = JSON.parse(JSON.stringify(defaultOrientationSurveyConfig));
      this.persistConfig();
    } catch (error) {
      console.error('Error loading orientation survey config:', error);
      this.config = JSON.parse(JSON.stringify(defaultOrientationSurveyConfig));
    }
  }

  private persistConfig() {
    void this.configStore.set(CONFIG_KEY, this.config);
  }

  getConfig(): OrientationSurveyConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  updateConfig(newConfig: OrientationSurveyConfig): OrientationSurveyConfig {
    this.config = JSON.parse(JSON.stringify(newConfig));
    this.persistConfig();
    return this.getConfig();
  }

  resetToDefault(): OrientationSurveyConfig {
    this.config = JSON.parse(JSON.stringify(defaultOrientationSurveyConfig));
    this.persistConfig();
    return this.getConfig();
  }
}
