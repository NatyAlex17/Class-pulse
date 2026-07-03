import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'apps/api/.data');
const CONFIG_FILE = path.join(DATA_DIR, 'orientation-survey-config.json');

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
        this.config = JSON.parse(fileContent);
      } else {
        this.config = JSON.parse(JSON.stringify(defaultOrientationSurveyConfig));
        this.persistConfig();
      }
    } catch (error) {
      console.error('Error loading orientation survey config:', error);
      this.config = JSON.parse(JSON.stringify(defaultOrientationSurveyConfig));
    }
  }

  private persistConfig() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error persisting orientation survey config:', error);
    }
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
