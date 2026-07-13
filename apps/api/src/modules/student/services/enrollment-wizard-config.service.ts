import { Injectable, OnModuleInit } from '@nestjs/common';

import { ConfigStoreService } from '../../../common/services/config-store.service';

const CONFIG_KEY = 'enrollment-wizard-config';
const LEGACY_CONFIG_FILE = 'enrollment-wizard-config.json';

export interface EnrollmentWizardStep {
  id: string;
  title: string;
  description: string;
  sections: Array<{
    id: string;
    title: string;
    description?: string;
    fields: Array<{
      id: string;
      label: string;
      type: 'text' | 'select' | 'choice' | 'number' | 'email';
      required?: boolean;
      placeholder?: string;
      options?: Array<{ label: string; value: string }>;
    }>;
  }>;
}

export interface EnrollmentWizardConfig {
  title: string;
  description: string;
  steps: EnrollmentWizardStep[];
}

const defaultEnrollmentWizardConfig: EnrollmentWizardConfig = {
  title: 'Enrollment Wizard',
  description: 'Complete your enrollment and customize your program path',
  steps: [
    {
      id: 'step-1',
      title: 'Step 1: Career Path',
      description: 'Choose your certification track',
      sections: [
        {
          id: 'career-section',
          title: 'Select Your Track',
          description: 'Choose the certification that matches your goals',
          fields: [
            {
              id: 'track',
              label: 'Which track would you like to pursue?',
              type: 'choice',
              required: true,
              options: [
                { label: 'CNA - Certified Nursing Assistant', value: 'cna' },
                { label: 'HHA - Home Health Aide', value: 'hha' },
                { label: 'CNA + HHA Bundle', value: 'cna-hha' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'step-2',
      title: 'Step 2: Personal Details',
      description: 'Tell us about yourself',
      sections: [
        {
          id: 'personal-section',
          title: 'Contact Information',
          fields: [
            {
              id: 'phone',
              label: 'Phone Number',
              type: 'text',
              required: true,
              placeholder: '(555) 123-4567',
            },
            {
              id: 'address',
              label: 'Street Address',
              type: 'text',
              required: true,
              placeholder: '123 Main St',
            },
            {
              id: 'city',
              label: 'City',
              type: 'text',
              required: true,
            },
            {
              id: 'state',
              label: 'State',
              type: 'select',
              required: true,
              options: [
                { label: 'California', value: 'CA' },
                { label: 'Texas', value: 'TX' },
                { label: 'New York', value: 'NY' },
                { label: 'Florida', value: 'FL' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'step-3',
      title: 'Step 3: Schedule',
      description: 'Choose your preferred schedule',
      sections: [
        {
          id: 'schedule-section',
          title: 'Program Schedule',
          description: 'Select the schedule that works best for you',
          fields: [
            {
              id: 'schedule',
              label: 'Preferred Schedule',
              type: 'choice',
              required: true,
              options: [
                { label: 'Full-Time (Mon-Fri)', value: 'fulltime' },
                { label: 'Part-Time (Evenings)', value: 'parttime-evening' },
                { label: 'Part-Time (Weekends)', value: 'parttime-weekend' },
              ],
            },
            {
              id: 'startDate',
              label: 'Preferred Start Date',
              type: 'text',
              required: true,
              placeholder: 'MM/DD/YYYY',
            },
          ],
        },
      ],
    },
  ],
};

@Injectable()
export class EnrollmentWizardConfigService implements OnModuleInit {
  private config: EnrollmentWizardConfig = JSON.parse(
    JSON.stringify(defaultEnrollmentWizardConfig),
  );

  constructor(private readonly configStore: ConfigStoreService) {}

  async onModuleInit() {
    await this.loadConfig();
  }

  private async loadConfig() {
    try {
      const stored = await this.configStore.load<EnrollmentWizardConfig>(CONFIG_KEY, LEGACY_CONFIG_FILE);
      if (stored) {
        this.config = stored;
        return;
      }
      this.config = JSON.parse(JSON.stringify(defaultEnrollmentWizardConfig));
      this.persistConfig();
    } catch (error) {
      console.error('Error loading enrollment wizard config:', error);
      this.config = JSON.parse(JSON.stringify(defaultEnrollmentWizardConfig));
    }
  }

  private persistConfig() {
    void this.configStore.set(CONFIG_KEY, this.config);
  }

  getConfig(): EnrollmentWizardConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  updateConfig(newConfig: EnrollmentWizardConfig): EnrollmentWizardConfig {
    this.config = JSON.parse(JSON.stringify(newConfig));
    this.persistConfig();
    return this.getConfig();
  }

  resetToDefault(): EnrollmentWizardConfig {
    this.config = JSON.parse(JSON.stringify(defaultEnrollmentWizardConfig));
    this.persistConfig();
    return this.getConfig();
  }
}
