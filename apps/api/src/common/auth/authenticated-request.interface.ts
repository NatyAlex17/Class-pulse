import { Request } from 'express';

import { LocalUserRecord } from '../../modules/auth/types/auth-user.types';

export interface AuthenticatedUserContext {
  accessToken: string;
  authUser: {
    id: string;
    email: string | null;
    role: string;
  };
  localUser: LocalUserRecord;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUserContext;
}
