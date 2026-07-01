import { Injectable, NotFoundException } from '@nestjs/common';

import { auditorPortalSeed } from '../data/auditor-portal.seed';
import { AuditorPortalState } from '../types/auditor-portal.types';

@Injectable()
export class AuditorPortalRepository {
  private readonly portalByAuditorId = new Map<string, AuditorPortalState>();

  constructor() {
    auditorPortalSeed.forEach((portal) => {
      this.portalByAuditorId.set(portal.profile.id, this.clone(portal));
    });
  }

  findByAuditorId(auditorId: string): AuditorPortalState {
    const portal = this.portalByAuditorId.get(auditorId);

    if (!portal) {
      throw new NotFoundException(`Auditor portal state not found for "${auditorId}".`);
    }

    return this.clone(portal);
  }

  save(portal: AuditorPortalState): AuditorPortalState {
    this.portalByAuditorId.set(portal.profile.id, this.clone(portal));
    return this.clone(portal);
  }

  private clone<TValue>(value: TValue): TValue {
    return JSON.parse(JSON.stringify(value)) as TValue;
  }
}
