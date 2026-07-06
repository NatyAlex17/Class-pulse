import { Injectable, NotFoundException } from '@nestjs/common';

import { instructorPortalSeed } from '../data/instructor-portal.seed';
import { InstructorPortalState } from '../types/instructor-portal.types';

@Injectable()
export class InstructorPortalRepository {
  private readonly portalByInstructorId = new Map<string, InstructorPortalState>();

  constructor() {
    instructorPortalSeed.forEach((portal) => {
      this.portalByInstructorId.set(portal.profile.id, this.clone(portal));
    });
  }

  findByInstructorId(instructorId: string): InstructorPortalState {
    const portal = this.portalByInstructorId.get(instructorId);

    if (!portal) {
      throw new NotFoundException(`Instructor portal state not found for "${instructorId}".`);
    }

    return this.clone(portal);
  }

  save(portal: InstructorPortalState): InstructorPortalState {
    this.portalByInstructorId.set(portal.profile.id, this.clone(portal));
    return this.clone(portal);
  }

  private clone<TValue>(value: TValue): TValue {
    return JSON.parse(JSON.stringify(value)) as TValue;
  }
}
