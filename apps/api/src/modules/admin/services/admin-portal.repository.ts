import { Injectable } from '@nestjs/common';

import { adminPortalSeed } from '../data/admin-portal.seed';
import { AdminPortalState } from '../types/admin-portal.types';

@Injectable()
export class AdminPortalRepository {
  private readonly portalByAdminId = new Map<string, AdminPortalState>();

  constructor() {
    adminPortalSeed.forEach((portal) => {
      this.portalByAdminId.set(portal.profile.id, this.clone(portal));
    });

    const primaryPortal = adminPortalSeed[0];
    if (primaryPortal && !this.portalByAdminId.has('admin-001')) {
      this.portalByAdminId.set('admin-001', this.personalizePortal(primaryPortal, 'admin-001'));
    }
  }

  findByAdminId(adminId: string): AdminPortalState {
    const existing = this.portalByAdminId.get(adminId);
    if (existing) {
      return this.clone(existing);
    }

    const template = this.portalByAdminId.get('admin-001') ?? adminPortalSeed[0];
    const personalized = this.personalizePortal(template, adminId);
    this.portalByAdminId.set(adminId, this.clone(personalized));
    return this.clone(personalized);
  }

  save(portal: AdminPortalState): AdminPortalState {
    this.portalByAdminId.set(portal.profile.id, this.clone(portal));
    return this.clone(portal);
  }

  private clone<TValue>(value: TValue): TValue {
    return JSON.parse(JSON.stringify(value)) as TValue;
  }

  private personalizePortal(template: AdminPortalState, adminId: string): AdminPortalState {
    const fullName = this.humanizeAdminId(adminId);
    return this.clone({
      ...template,
      profile: {
        ...template.profile,
        id: adminId,
        fullName,
        email: `${adminId}@classpulse.local`,
      },
      dashboard: {
        ...template.dashboard,
        profile: {
          ...template.dashboard.profile,
          id: adminId,
          fullName,
          email: `${adminId}@classpulse.local`,
        },
      },
      auditTrail: template.auditTrail.map((event) => ({
        ...event,
        actor: event.actor === template.profile.id ? adminId : event.actor,
        target: event.target === template.profile.id ? adminId : event.target,
      })),
    });
  }

  private humanizeAdminId(adminId: string) {
    return adminId
      .replace(/^admin[-_]?/i, '')
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'Admin';
  }
}
