import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { Injectable, NotFoundException } from '@nestjs/common';

import type { LocalUserRecord } from '../../auth/types/auth-user.types';
import { auditorPortalSeed } from '../data/auditor-portal.seed';
import { AuditorPortalState } from '../types/auditor-portal.types';

@Injectable()
export class AuditorPortalRepository {
  private readonly storagePath = join(process.cwd(), '.data', 'auditor-portals.json');
  private readonly persistenceEnabled = process.env.NODE_ENV !== 'test';
  private readonly portalByAuditorId = new Map<string, AuditorPortalState>();

  constructor() {
    this.loadState();
  }

  findByAuditorId(auditorId: string): AuditorPortalState {
    const portal = this.portalByAuditorId.get(auditorId);

    if (!portal) {
      throw new NotFoundException(`Auditor portal state not found for "${auditorId}".`);
    }

    return this.clone(portal);
  }

  ensureForLocalUser(localUser: LocalUserRecord, options?: { fullName?: string }): AuditorPortalState {
    const existing = this.portalByAuditorId.get(localUser.id);

    if (existing) {
      return this.clone(existing);
    }

    const template = auditorPortalSeed[0];
    const fullName = options?.fullName?.trim() || this.humanizeName(localUser.email);
    const memberSince = new Date().toISOString().slice(0, 10);
    const personalized = this.clone({
      ...template,
      profile: {
        ...template.profile,
        id: localUser.id,
        fullName,
        title: 'Compliance Auditor',
        email: localUser.email,
        phone: '',
        location: '',
        memberSince,
        credentials: [],
        assignedPrograms: [],
      },
      dashboard: {
        ...template.dashboard,
        profile: {
          ...template.dashboard.profile,
          id: localUser.id,
          fullName,
          title: 'Compliance Auditor',
          email: localUser.email,
          phone: '',
          location: '',
          memberSince,
          credentials: [],
          assignedPrograms: [],
        },
      },
      auditTrail: [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          action: 'Auditor account initialized',
          actor: 'System',
          status: 'Success' as const,
          details: 'Auditor workspace created from admin-managed account provisioning.',
          target: localUser.id,
        },
      ],
    } satisfies AuditorPortalState);

    this.portalByAuditorId.set(localUser.id, personalized);
    if (this.persistenceEnabled) {
      this.persistState();
    }
    return this.clone(personalized);
  }

  save(portal: AuditorPortalState): AuditorPortalState {
    this.portalByAuditorId.set(portal.profile.id, this.clone(portal));
    if (this.persistenceEnabled) {
      this.persistState();
    }
    return this.clone(portal);
  }

  private clone<TValue>(value: TValue): TValue {
    return JSON.parse(JSON.stringify(value)) as TValue;
  }

  private loadState() {
    if (!this.persistenceEnabled) {
      this.loadSeedState();
      return;
    }

    if (!existsSync(this.storagePath)) {
      this.loadSeedState();
      return;
    }

    try {
      const raw = readFileSync(this.storagePath, 'utf8');
      const parsed = JSON.parse(raw) as { portals?: AuditorPortalState[] };

      this.portalByAuditorId.clear();

      (parsed.portals ?? []).forEach((portal) => {
        this.portalByAuditorId.set(portal.profile.id, this.clone(portal));
      });

      if (this.portalByAuditorId.size === 0) {
        this.loadSeedState();
      }
    } catch {
      this.portalByAuditorId.clear();
      this.loadSeedState();
    }
  }

  private loadSeedState() {
    this.portalByAuditorId.clear();
    auditorPortalSeed.forEach((portal) => {
      this.portalByAuditorId.set(portal.profile.id, this.clone(portal));
    });
  }

  private persistState() {
    mkdirSync(join(process.cwd(), '.data'), { recursive: true });
    writeFileSync(
      this.storagePath,
      JSON.stringify(
        {
          portals: Array.from(this.portalByAuditorId.values()),
        },
        null,
        2,
      ),
      'utf8',
    );
  }

  private humanizeName(email: string) {
    const nameSource = email.split('@')[0] ?? 'auditor';

    return nameSource
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
