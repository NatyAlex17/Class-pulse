import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'apps/api/.data');
const CONFIG_FILE = path.join(DATA_DIR, 'cohorts-config.json');

export interface CohortDefinition {
  id: string;
  name: string;
  description: string;
  moduleIds: string[];
  feeAmount: number;
  isOpen: boolean;
}

export interface CohortsConfig {
  cohorts: CohortDefinition[];
}

const defaultCohortsConfig: CohortsConfig = {
  cohorts: [],
};

@Injectable()
export class CohortsConfigService implements OnModuleInit {
  private config: CohortsConfig = defaultCohortsConfig;

  onModuleInit() {
    this.loadConfig();
  }

  getConfig(): CohortsConfig {
    return this.config;
  }

  findCohort(cohortId: string): CohortDefinition | undefined {
    return this.config.cohorts.find((cohort) => cohort.id === cohortId);
  }

  updateConfig(newConfig: CohortsConfig): CohortsConfig {
    this.config = this.normalizeConfig(newConfig);
    this.persistConfig();
    return this.config;
  }

  resetToDefault(): CohortsConfig {
    this.config = defaultCohortsConfig;
    this.persistConfig();
    return this.config;
  }

  private normalizeConfig(rawConfig: CohortsConfig): CohortsConfig {
    if (!rawConfig || !Array.isArray(rawConfig.cohorts)) {
      throw new BadRequestException('Cohorts configuration must contain a "cohorts" array.');
    }

    const seenIds = new Set<string>();
    const cohorts = rawConfig.cohorts.map((cohort, index) => {
      const id = String(cohort.id ?? '').trim();
      const name = String(cohort.name ?? '').trim();

      if (!id || !name) {
        throw new BadRequestException(`Cohort at position ${index + 1} requires both an id and a name.`);
      }

      if (seenIds.has(id)) {
        throw new BadRequestException(`Duplicate cohort id "${id}".`);
      }
      seenIds.add(id);

      const feeAmount = Number(cohort.feeAmount);
      if (!Number.isFinite(feeAmount) || feeAmount < 0) {
        throw new BadRequestException(`Cohort "${name}" requires a fee amount of zero or more.`);
      }

      const moduleIds = Array.isArray(cohort.moduleIds)
        ? Array.from(new Set(cohort.moduleIds.map((moduleId) => String(moduleId).trim()).filter(Boolean)))
        : [];

      return {
        id,
        name,
        description: String(cohort.description ?? '').trim(),
        moduleIds,
        feeAmount,
        isOpen: Boolean(cohort.isOpen),
      } satisfies CohortDefinition;
    });

    return { cohorts };
  }

  private ensureDataDir() {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  private loadConfig() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
        this.config = JSON.parse(raw) as CohortsConfig;
        return;
      }
    } catch {
      // Fall through to defaults on unreadable/corrupt file.
    }

    this.config = defaultCohortsConfig;
    this.persistConfig();
  }

  private persistConfig() {
    this.ensureDataDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf8');
  }
}
