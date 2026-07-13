import { Injectable, OnModuleInit } from '@nestjs/common';

import { ConfigStoreService } from '../../../common/services/config-store.service';

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

const CONFIG_KEY = 'cdph-e276-program';
const LEGACY_CONFIG_FILE = 'cdph-e276-program.json';

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

  constructor(private readonly configStore: ConfigStoreService) {}

  async onModuleInit() {
    await this.loadConfig();
  }

  private async loadConfig() {
    try {
      const stored = await this.configStore.load<Partial<CdphE276ProgramProfile>>(CONFIG_KEY, LEGACY_CONFIG_FILE);
      if (stored) {
        this.profile = { ...defaultProfile, ...stored };
        return;
      }
      this.profile = { ...defaultProfile };
      this.persistConfig();
    } catch (error) {
      console.error('Error loading CDPH E276 program profile:', error);
      this.profile = { ...defaultProfile };
    }
  }

  private persistConfig() {
    void this.configStore.set(CONFIG_KEY, this.profile);
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
