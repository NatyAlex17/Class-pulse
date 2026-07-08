import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@supabase/supabase-js';

import { AuditorPortalService } from '../../auditor/services/auditor-portal.service';
import { InstructorPortalService } from '../../instructor/services/instructor-portal.service';
import { StudentPortalService } from '../../student/services/student-portal.service';
import { SupabaseService } from './supabase.service';
import { LocalUsersService } from './local-users.service';

@Injectable()
export class SupabaseAuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly localUsersService: LocalUsersService,
    private readonly studentPortalService: StudentPortalService,
    private readonly instructorPortalService: InstructorPortalService,
    private readonly auditorPortalService: AuditorPortalService,
  ) {}

  async getUserFromAccessToken(accessToken: string): Promise<User> {
    const { data, error } = await this.supabaseService.publicClient.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new UnauthorizedException(error?.message ?? 'Invalid Supabase access token.');
    }

    return data.user;
  }

  async getOrCreateLocalUserFromAccessToken(accessToken: string) {
    const user = await this.getUserFromAccessToken(accessToken);
    const localUser = await this.localUsersService.syncSupabaseUser(user);

    if (localUser.role === 'student') {
      this.studentPortalService.ensurePortalForLocalUser(localUser);
    } else if (localUser.role === 'instructor') {
      this.instructorPortalService.ensurePortalForLocalUser(localUser);
    } else if (localUser.role === 'auditor') {
      const fullName =
        typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim() : '';
      this.auditorPortalService.ensurePortalForLocalUser(localUser, {
        fullName: fullName || undefined,
      });
    }

    return {
      user,
      localUser,
    };
  }
}
