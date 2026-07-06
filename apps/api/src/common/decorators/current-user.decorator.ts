import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthenticatedRequest } from '../auth/authenticated-request.interface';

export const CurrentUser = createParamDecorator((_: never, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user;
});
