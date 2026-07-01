import { Injectable } from '@nestjs/common';
import type { EntranceExamQuestionDefinition } from '../types/student-portal.types';
import { defaultEntranceExamConfig } from '../data/student-portal.seed';

export interface EntranceExamConfig {
  intro: string;
  passingScore: number;
  questions: EntranceExamQuestionDefinition[];
}

@Injectable()
export class ExamConfigService {
  private config: EntranceExamConfig = defaultEntranceExamConfig;

  getConfig(): EntranceExamConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  updateConfig(newConfig: EntranceExamConfig): EntranceExamConfig {
    this.config = JSON.parse(JSON.stringify(newConfig));
    return this.getConfig();
  }

  resetToDefault(): EntranceExamConfig {
    this.config = JSON.parse(JSON.stringify(defaultEntranceExamConfig));
    return this.getConfig();
  }
}
