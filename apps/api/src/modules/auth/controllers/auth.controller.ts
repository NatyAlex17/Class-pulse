import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';

import { createApiResponse } from '../../../common/utils/create-api-response';
import { SupabaseAuthService } from '../services/supabase-auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly supabaseAuthService: SupabaseAuthService) {}

  @Get('me')
  async getCurrentUser(@Headers('authorization') authorization?: string) {
    const accessToken = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length).trim()
      : undefined;

    if (!accessToken) {
      throw new UnauthorizedException('Missing Bearer token.');
    }

    const { user, localUser } =
      await this.supabaseAuthService.getOrCreateLocalUserFromAccessToken(accessToken);

    return createApiResponse(
      {
        authUser: {
          id: user.id,
          email: user.email ?? null,
          phone: user.phone ?? null,
          appMetadata: user.app_metadata,
          userMetadata: user.user_metadata,
        },
        localUser,
      },
      'Authenticated user loaded and synced successfully.',
    );
  }
}
