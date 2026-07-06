import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from './authenticated-request.interface';
import { SupabaseAuthService } from '../../modules/auth/services/supabase-auth.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabaseAuthService: SupabaseAuthService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const accessToken = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length).trim()
      : undefined;

    if (!accessToken) {
      throw new UnauthorizedException('Missing Bearer token.');
    }

    const { user, localUser } =
      await this.supabaseAuthService.getOrCreateLocalUserFromAccessToken(accessToken);

    request.user = {
      accessToken,
      authUser: {
        id: user.id,
        email: user.email ?? null,
        role:
          typeof user.user_metadata?.role === 'string' && user.user_metadata.role.trim()
            ? user.user_metadata.role.trim().toLowerCase()
            : localUser.role,
      },
      localUser,
    };

    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredRoles.length > 0 && !requiredRoles.includes(localUser.role)) {
      throw new ForbiddenException(
        `Role "${localUser.role}" cannot access this resource. Required roles: ${requiredRoles.join(', ')}.`,
      );
    }

    const requestedStudentId = request.params?.studentId;
    if (localUser.role === 'student' && requestedStudentId && requestedStudentId !== localUser.id) {
      throw new ForbiddenException('Students may only access their own portal resources.');
    }

    if (localUser.status !== 'active') {
      throw new ForbiddenException('The local user account is not active.');
    }

    return true;
  }
}
