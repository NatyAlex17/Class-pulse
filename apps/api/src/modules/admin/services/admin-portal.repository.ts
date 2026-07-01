import { Injectable, NotFoundException } from '@nestjs/common';

import { adminPortalSeed } from '../data/admin-portal.seed';
import { AdminPortalState } from '../types/admin-portal.types';

@Injectable()
export class AdminPortalRepository {
  private readonly portalByAdminId = new Map<string, AdminPortalState>();

  constructor() {
    adminPortalSeed.forEach((portal) => {
      this.portalByAdminId.set(portal.profile.id, this.clone(portal));
    });
  }

  findByAdminId(adminId: string): AdminPortalState {
    const portal = this.portalByAdminId.get(adminId);

    if (!portal) {
      throw new NotFoundException(`Admin portal state not found for "${adminId}".`);
    }

    return this.clone(portal);
  }

  save(portal: AdminPortalState): AdminPortalState {
    this.portalByAdminId.set(portal.profile.id, this.clone(portal));
    return this.clone(portal);
  }

  private clone<TValue>(value: TValue): TValue {
    return JSON.parse(JSON.stringify(value)) as TValue;
  }
}
