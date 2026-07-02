import { BadRequestException, Injectable } from '@nestjs/common';

import type {
  LearningModuleDefinition,
  LearningResourceDefinition,
  LearningSectionDefinition,
} from '../types/student-portal.types';

export interface LearningResourcesConfig {
  modules: LearningModuleDefinition[];
}

const defaultLearningResourcesConfig: LearningResourcesConfig = {
  modules: [
    {
      id: 'm1',
      title: 'Foundation of Patient Care',
      summary: 'Core ethics, workflow, and patient communication.',
      requiredHours: 20,
      sections: [
        {
          id: 'm1-start',
          title: 'Getting Started',
          description: 'Start with the core lecture and handbook.',
          resources: [
            {
              id: 'm1-video',
              title: 'Intro lecture',
              type: 'video',
              duration: '18 min',
              description: 'Recorded orientation-style lecture.',
              url: 'https://www.youtube.com/watch?v=gUWJ-6nL5-8',
            },
            {
              id: 'm1-pdf',
              title: 'Handbook packet',
              type: 'pdf',
              duration: '6 pages',
              description: 'FERPA and attendance policy overview.',
              url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            },
          ],
        },
      ],
    },
    {
      id: 'm2',
      title: 'Anatomy & Physiology',
      summary: 'System review, terminology, and patient observation.',
      requiredHours: 15,
      sections: [
        {
          id: 'm2-systems',
          title: 'Systems Overview',
          description: 'Video lesson and guided reference link.',
          resources: [
            {
              id: 'm2-video',
              title: 'Body systems overview',
              type: 'video',
              duration: '22 min',
              description: 'Module recording.',
              url: 'https://www.youtube.com/watch?v=gUWJ-6nL5-8',
            },
            {
              id: 'm2-link',
              title: 'System terminology notes',
              type: 'link',
              duration: '12 min',
              description: 'Self-paced reference material.',
              url: 'https://medlineplus.gov/anatomy.html',
            },
          ],
        },
      ],
    },
    {
      id: 'm3',
      title: 'Vital Signs & Monitoring',
      summary: 'Temperature, pulse, respiration, blood pressure, and charting.',
      requiredHours: 25,
      sections: [
        {
          id: 'm3-theory',
          title: 'Theory',
          description: 'Instructional resources before practical work.',
          resources: [
            {
              id: 'm3-video',
              title: 'Vital signs lecture',
              type: 'video',
              duration: '24 min',
              description: 'Play recorded lesson and log engagement.',
              url: 'https://www.youtube.com/watch?v=gUWJ-6nL5-8',
            },
            {
              id: 'm3-pdf',
              title: 'Procedure PDF',
              type: 'pdf',
              duration: '8 pages',
              description: 'Printable bedside checklist.',
              url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            },
            {
              id: 'm3-link',
              title: 'Clinical reading notes',
              type: 'link',
              duration: '14 min',
              description: 'Reference ranges and documentation standards.',
              url: 'https://medlineplus.gov/vitalsigns.html',
            },
          ],
        },
      ],
    },
    {
      id: 'm4',
      title: 'Clinical Readiness',
      summary: 'Scenario walkthroughs, safety checks, and final preparation.',
      requiredHours: 20,
      sections: [
        {
          id: 'm4-prep',
          title: 'Preparation',
          description: 'Wrap up the theory path before clinical practice.',
          resources: [
            {
              id: 'm4-video',
              title: 'Simulation briefing',
              type: 'video',
              duration: '20 min',
              description: 'Unlocks after Module 3 exam pass.',
              url: 'https://www.youtube.com/watch?v=gUWJ-6nL5-8',
            },
            {
              id: 'm4-pdf',
              title: 'Clinical packet',
              type: 'pdf',
              duration: '5 pages',
              description: 'Lab expectations and supply checklist.',
              url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            },
          ],
        },
      ],
    },
  ],
};

@Injectable()
export class LearningResourcesConfigService {
  private config: LearningResourcesConfig = JSON.parse(JSON.stringify(defaultLearningResourcesConfig));

  getConfig(): LearningResourcesConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  updateConfig(newConfig: LearningResourcesConfig): LearningResourcesConfig {
    this.config = this.validateConfig(newConfig);
    return this.getConfig();
  }

  resetToDefault(): LearningResourcesConfig {
    this.config = JSON.parse(JSON.stringify(defaultLearningResourcesConfig));
    return this.getConfig();
  }

  private validateConfig(config: LearningResourcesConfig): LearningResourcesConfig {
    const modules = (config.modules ?? []).map((module) => ({
      id: module.id.trim(),
      title: module.title.trim(),
      summary: module.summary.trim(),
      requiredHours: module.requiredHours,
      sections: (module.sections ?? []).map((section) => ({
        id: section.id.trim(),
        title: section.title.trim(),
        description: section.description.trim(),
        resources: (section.resources ?? []).map((resource) => this.normalizeResource(resource)),
      })),
    }));

    if (modules.length === 0) {
      throw new BadRequestException('At least one learning module is required.');
    }

    modules.forEach((module, moduleIndex) => {
      if (!module.id || !module.title || !module.summary) {
        throw new BadRequestException(`Module ${moduleIndex + 1} must include an id, title, and summary.`);
      }

      if (!Number.isFinite(module.requiredHours) || module.requiredHours <= 0) {
        throw new BadRequestException(`Module "${module.title}" must include required hours greater than zero.`);
      }

      if (module.sections.length === 0) {
        throw new BadRequestException(`Module "${module.title}" must include at least one section.`);
      }

      module.sections.forEach((section, sectionIndex) => {
        if (!section.id || !section.title) {
          throw new BadRequestException(
            `Section ${sectionIndex + 1} in module "${module.title}" must include an id and title.`,
          );
        }

        if (section.resources.length === 0) {
          throw new BadRequestException(`Section "${section.title}" in module "${module.title}" must include resources.`);
        }
      });
    });

    return { modules };
  }

  private normalizeResource(resource: LearningResourceDefinition): LearningResourceDefinition {
    const normalized = {
      ...resource,
      id: resource.id.trim(),
      title: resource.title.trim(),
      duration: resource.duration.trim(),
      description: resource.description.trim(),
      url: resource.url.trim(),
    };

    if (!normalized.id || !normalized.title || !normalized.duration || !normalized.url) {
      throw new BadRequestException('Each learning resource must include an id, title, duration, and URL.');
    }

    if (!['video', 'pdf', 'link'].includes(normalized.type)) {
      throw new BadRequestException(`Learning resource "${normalized.title}" has an unsupported type.`);
    }

    return normalized;
  }
}
