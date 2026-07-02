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
      summary: 'Program kickoff, communication basics, safety expectations, and first readiness check.',
      requiredHours: 20,
      sections: [
        {
          id: 'm1-welcome',
          title: 'Welcome and Orientation',
          description: 'Start the course exactly like a modern LMS with overview media and downloadable handbooks.',
          resources: [
            {
              id: 'm1-video',
              title: 'Program welcome lecture',
              type: 'video',
              duration: '18 min',
              description: 'Recorded orientation-style lecture introducing expectations and navigation.',
              url: 'https://www.youtube.com/watch?v=gUWJ-6nL5-8',
            },
            {
              id: 'm1-pdf',
              title: 'Student handbook packet',
              type: 'pdf',
              duration: '6 pages',
              description: 'Attendance, FERPA, professionalism, and escalation guidance.',
              url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            },
            {
              id: 'm1-text',
              title: 'How to succeed in self-paced study',
              type: 'text',
              duration: '12 min',
              description: 'Instructor-authored lesson text for study habits and accountability.',
              content:
                'Successful students check the module roadmap before starting, take notes during each lesson, and complete every section in sequence. Treat each section as a required checkpoint, not just optional reading.',
            },
          ],
        },
        {
          id: 'm1-readiness',
          title: 'Readiness Check',
          description: 'End the opening module with a checkpoint before students move deeper into the curriculum.',
          resources: [
            {
              id: 'm1-exam',
              title: 'Patient care readiness checkpoint',
              type: 'exam',
              duration: '10 questions',
              description: 'Gate assessment covering orientation, communication, and policy understanding.',
              content: 'Students must score at least 70% before progressing to the next module.',
              questionCount: 10,
              passingScore: 70,
            },
          ],
        },
      ],
    },
    {
      id: 'm2',
      title: 'Anatomy and Physiology',
      summary: 'Major body systems, healthcare terminology, and learner-guided reference materials.',
      requiredHours: 15,
      sections: [
        {
          id: 'm2-systems',
          title: 'Systems Overview',
          description: 'Blend lecture, text lessons, and curated reference links.',
          resources: [
            {
              id: 'm2-video',
              title: 'Body systems overview',
              type: 'video',
              duration: '22 min',
              description: 'Module recording introducing the major systems and their functions.',
              url: 'https://www.youtube.com/watch?v=gUWJ-6nL5-8',
            },
            {
              id: 'm2-text',
              title: 'Medical terminology fundamentals',
              type: 'text',
              duration: '15 min',
              description: 'Text lesson covering prefixes, suffixes, and charting language.',
              content:
                'Terminology should be learned in patterns. Focus on prefixes for location and quantity, roots for structure or function, and suffixes for procedures or conditions.',
            },
            {
              id: 'm2-link',
              title: 'External anatomy reference',
              type: 'link',
              duration: '12 min',
              description: 'Self-paced reference material for body-system review.',
              url: 'https://medlineplus.gov/anatomy.html',
            },
          ],
        },
      ],
    },
    {
      id: 'm3',
      title: 'Vital Signs and Monitoring',
      summary: 'Temperature, pulse, respiration, blood pressure, charting, and skill validation.',
      requiredHours: 25,
      sections: [
        {
          id: 'm3-theory',
          title: 'Theory and Demonstration',
          description: 'Students review lecture content, procedures, and reference material before assessment.',
          resources: [
            {
              id: 'm3-video',
              title: 'Vital signs lecture',
              type: 'video',
              duration: '24 min',
              description: 'Core lecture on obtaining and documenting vital signs correctly.',
              url: 'https://www.youtube.com/watch?v=gUWJ-6nL5-8',
            },
            {
              id: 'm3-pdf',
              title: 'Procedure checklist PDF',
              type: 'pdf',
              duration: '8 pages',
              description: 'Printable bedside checklist and validation standard.',
              url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            },
            {
              id: 'm3-link',
              title: 'Clinical reference link',
              type: 'link',
              duration: '14 min',
              description: 'Reference ranges and documentation standards.',
              url: 'https://medlineplus.gov/vitalsigns.html',
            },
          ],
        },
        {
          id: 'm3-assessment',
          title: 'Assessment and Signoff',
          description: 'Students complete the knowledge check before the next module unlocks.',
          resources: [
            {
              id: 'm3-exam',
              title: 'Vital signs module exam',
              type: 'exam',
              duration: '20 questions',
              description: 'Final assessment for the vital-signs module.',
              content: 'Review the checklist and notes before launching this exam.',
              questionCount: 20,
              passingScore: 70,
            },
          ],
        },
      ],
    },
  ],
};

const supportedResourceTypes = ['video', 'pdf', 'link', 'text', 'exam'] as const;
const urlRequiredTypes = new Set(['video', 'pdf', 'link']);
const contentFriendlyTypes = new Set(['text', 'exam']);

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
    const modules = (config.modules ?? []).map((module) => this.normalizeModule(module));

    if (modules.length === 0) {
      throw new BadRequestException('At least one learning module is required.');
    }

    const moduleIds = new Set<string>();

    modules.forEach((module, moduleIndex) => {
      if (!module.id || !module.title || !module.summary) {
        throw new BadRequestException(`Module ${moduleIndex + 1} must include an id, title, and summary.`);
      }

      if (moduleIds.has(module.id)) {
        throw new BadRequestException(`Module id "${module.id}" must be unique.`);
      }
      moduleIds.add(module.id);

      if (!Number.isFinite(module.requiredHours) || module.requiredHours <= 0) {
        throw new BadRequestException(`Module "${module.title}" must include required hours greater than zero.`);
      }

      if (module.sections.length === 0) {
        throw new BadRequestException(`Module "${module.title}" must include at least one section.`);
      }

      const sectionIds = new Set<string>();
      const resourceIds = new Set<string>();

      module.sections.forEach((section, sectionIndex) => {
        if (!section.id || !section.title) {
          throw new BadRequestException(
            `Section ${sectionIndex + 1} in module "${module.title}" must include an id and title.`,
          );
        }

        if (sectionIds.has(section.id)) {
          throw new BadRequestException(`Section id "${section.id}" in module "${module.title}" must be unique.`);
        }
        sectionIds.add(section.id);

        if (section.resources.length === 0) {
          throw new BadRequestException(`Section "${section.title}" in module "${module.title}" must include resources.`);
        }

        section.resources.forEach((resource) => {
          if (resourceIds.has(resource.id)) {
            throw new BadRequestException(
              `Resource id "${resource.id}" must be unique within module "${module.title}".`,
            );
          }
          resourceIds.add(resource.id);
        });
      });
    });

    return { modules };
  }

  private normalizeModule(module: LearningModuleDefinition): LearningModuleDefinition {
    return {
      id: module.id.trim(),
      title: module.title.trim(),
      summary: module.summary.trim(),
      requiredHours: Number(module.requiredHours),
      sections: (module.sections ?? []).map((section) => this.normalizeSection(section)),
    };
  }

  private normalizeSection(section: LearningSectionDefinition): LearningSectionDefinition {
    return {
      id: section.id.trim(),
      title: section.title.trim(),
      description: section.description.trim(),
      resources: (section.resources ?? []).map((resource) => this.normalizeResource(resource)),
    };
  }

  private normalizeResource(resource: LearningResourceDefinition): LearningResourceDefinition {
    const normalized: LearningResourceDefinition = {
      ...resource,
      id: resource.id.trim(),
      title: resource.title.trim(),
      type: resource.type,
      duration: resource.duration.trim(),
      description: resource.description.trim(),
      url: resource.url?.trim() || undefined,
      content: resource.content?.trim() || undefined,
      questionCount:
        resource.questionCount === undefined || resource.questionCount === null
          ? undefined
          : Number(resource.questionCount),
      passingScore:
        resource.passingScore === undefined || resource.passingScore === null
          ? undefined
          : Number(resource.passingScore),
    };

    if (!normalized.id || !normalized.title || !normalized.duration) {
      throw new BadRequestException('Each learning resource must include an id, title, and duration.');
    }

    if (!supportedResourceTypes.includes(normalized.type)) {
      throw new BadRequestException(`Learning resource "${normalized.title}" has an unsupported type.`);
    }

    if (urlRequiredTypes.has(normalized.type) && !normalized.url) {
      throw new BadRequestException(`Learning resource "${normalized.title}" must include a URL.`);
    }

    if (!urlRequiredTypes.has(normalized.type)) {
      normalized.url = undefined;
    }

    if (contentFriendlyTypes.has(normalized.type) && !normalized.content && !normalized.description) {
      throw new BadRequestException(
        `Learning resource "${normalized.title}" must include content or a description.`,
      );
    }

    if (normalized.type === 'exam') {
      if (!normalized.questionCount || normalized.questionCount <= 0) {
        throw new BadRequestException(`Exam "${normalized.title}" must include a question count greater than zero.`);
      }

      if (
        normalized.passingScore !== undefined &&
        (!Number.isFinite(normalized.passingScore) || normalized.passingScore < 0 || normalized.passingScore > 100)
      ) {
        throw new BadRequestException(`Exam "${normalized.title}" must include a passing score between 0 and 100.`);
      }
    } else {
      normalized.questionCount = undefined;
      normalized.passingScore = undefined;
    }

    return normalized;
  }
}
