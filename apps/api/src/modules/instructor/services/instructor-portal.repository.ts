import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { Injectable, NotFoundException } from '@nestjs/common';

import type { LocalUserRecord } from '../../auth/types/auth-user.types';
import { instructorPortalSeed } from '../data/instructor-portal.seed';
import { InstructorPortalState } from '../types/instructor-portal.types';
import { InstructorOnboardingQuestionsConfigService } from './instructor-onboarding-questions-config.service';

@Injectable()
export class InstructorPortalRepository {
  private readonly storagePath = join(process.cwd(), '.data', 'instructor-portals.json');
  private readonly portalByInstructorId = new Map<string, InstructorPortalState>();

  constructor(private readonly onboardingQuestionsConfigService: InstructorOnboardingQuestionsConfigService) {
    this.loadState();
  }

  findByInstructorId(instructorId: string): InstructorPortalState {
    const portal = this.portalByInstructorId.get(instructorId);

    if (!portal) {
      throw new NotFoundException(`Instructor portal state not found for "${instructorId}".`);
    }

    return this.clone(portal);
  }

  findAll(): InstructorPortalState[] {
    return Array.from(this.portalByInstructorId.values()).map((portal) => this.clone(portal));
  }

  ensureForLocalUser(localUser: LocalUserRecord): InstructorPortalState {
    const existing = this.portalByInstructorId.get(localUser.id);
    if (existing) {
      return this.clone(existing);
    }

    const template = instructorPortalSeed[0];
    const fullName = this.humanizeName(localUser.email);
    const personalized: InstructorPortalState = this.clone({
      ...template,
      profile: {
        ...template.profile,
        id: localUser.id,
        fullName,
        email: localUser.email,
        notes: '',
        avatarUrl: undefined,
        credentials: [],
      },
      workflowStage: 'onboarding',
      onboarding: {
        questions: this.onboardingQuestionsConfigService
          .getConfig()
          .questions.map((question) => ({ ...question, answer: '' })),
        readinessUploads: {},
        readinessDocumentFiles: {},
        agreedToTerms: false,
        selectedModuleIds: [],
        submitted: false,
      },
      studentNotes: {},
      skillReviews: {},
      activeStudentId: '',
      conversations: [],
      activeConversationId: '',
      schedule: [],
      documents: [],
      auditTrail: [],
    });

    this.portalByInstructorId.set(localUser.id, personalized);
    this.persistState();
    return this.clone(personalized);
  }

  save(portal: InstructorPortalState): InstructorPortalState {
    this.portalByInstructorId.set(portal.profile.id, this.clone(portal));
    this.persistState();
    return this.clone(portal);
  }

  private clone<TValue>(value: TValue): TValue {
    return JSON.parse(JSON.stringify(value)) as TValue;
  }

  private loadState() {
    if (!existsSync(this.storagePath)) {
      this.loadSeedState();
      return;
    }

    try {
      const raw = readFileSync(this.storagePath, 'utf8');
      const parsed = JSON.parse(raw) as { portals?: InstructorPortalState[] };

      this.portalByInstructorId.clear();

      (parsed.portals ?? []).forEach((portal) => {
        this.portalByInstructorId.set(portal.profile.id, this.clone(portal));
      });

      if (this.portalByInstructorId.size === 0) {
        this.loadSeedState();
      }
    } catch {
      this.portalByInstructorId.clear();
      this.loadSeedState();
    }
  }

  private loadSeedState() {
    this.portalByInstructorId.clear();
    instructorPortalSeed.forEach((portal) => {
      this.portalByInstructorId.set(portal.profile.id, this.clone(portal));
    });
  }

  private persistState() {
    mkdirSync(join(process.cwd(), '.data'), { recursive: true });
    writeFileSync(
      this.storagePath,
      JSON.stringify(
        {
          portals: Array.from(this.portalByInstructorId.values()),
        },
        null,
        2,
      ),
      'utf8',
    );
  }

  private humanizeName(email: string) {
    const nameSource = email.split('@')[0] ?? 'instructor';

    return nameSource
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
