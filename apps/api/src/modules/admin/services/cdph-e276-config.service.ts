import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export type CdphE276ProviderType = 'Educational Institution' | 'Skilled Nursing Facility' | 'Intermediate Care Facility';

export type CdphE276ApplicationType =
  | 'Online NATP'
  | 'Online Alternative NATP Type I'
  | 'Online Alternative NATP Type II';

export type CdphE276ProgramType = 'Synchronous' | 'Asynchronous';

export interface CdphE276ProgramProfile {
  providerName: string;
  mailingAddress: string;
  county: string;
  phoneNumber: string;
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  providerType: CdphE276ProviderType;
  applicationType: CdphE276ApplicationType;
  programType: CdphE276ProgramType;
  providerLandingPageUrl: string;
  learningManagementSystemUrl: string;
  programLength: string;
  curriculumNameEditionYear: string;
  studentFees: string;
}

const DATA_DIR = path.join(process.cwd(), 'apps/api/.data');
const CONFIG_FILE = path.join(DATA_DIR, 'cdph-e276-program.json');

const defaultProfile: CdphE276ProgramProfile = {
  providerName: '',
  mailingAddress: '',
  county: '',
  phoneNumber: '',
  contactPersonName: '',
  contactPersonPhone: '',
  contactPersonEmail: '',
  providerType: 'Educational Institution',
  applicationType: 'Online NATP',
  programType: 'Asynchronous',
  providerLandingPageUrl: '',
  learningManagementSystemUrl: '',
  programLength: '',
  curriculumNameEditionYear: '',
  studentFees: '',
};

@Injectable()
export class CdphE276ConfigService implements OnModuleInit {
  private profile: CdphE276ProgramProfile = { ...defaultProfile };

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
        this.profile = { ...defaultProfile, ...JSON.parse(fileContent) };
      } else {
        this.profile = { ...defaultProfile };
        this.persistConfig();
      }
    } catch (error) {
      console.error('Error loading CDPH E276 program profile:', error);
      this.profile = { ...defaultProfile };
    }
  }

  private persistConfig() {
    this.ensureDataDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.profile, null, 2), 'utf-8');
  }

  getProfile(): CdphE276ProgramProfile {
    return { ...this.profile };
  }

  updateProfile(update: Partial<CdphE276ProgramProfile>): CdphE276ProgramProfile {
    this.profile = { ...this.profile, ...update };
    this.persistConfig();
    return this.getProfile();
  }
}
