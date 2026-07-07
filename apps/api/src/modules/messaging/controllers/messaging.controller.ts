import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { SupabaseAuthGuard } from '../../../common/auth/supabase-auth.guard';
import type { AuthenticatedUserContext } from '../../../common/auth/authenticated-request.interface';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { createApiResponse } from '../../../common/utils/create-api-response';
import { MessagingService } from '../services/messaging.service';
import type { CreateThreadDto, MarkThreadReadDto, SendMessageDto } from '../types/messaging.types';

@UseGuards(SupabaseAuthGuard)
@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('threads')
  @Roles('student', 'instructor', 'admin', 'auditor')
  async getThreads(@CurrentUser() currentUser: AuthenticatedUserContext) {
    return createApiResponse(
      await this.messagingService.listThreadsForUser(currentUser),
      'Messaging threads retrieved successfully.',
    );
  }

  @Get('contacts')
  @Roles('student', 'instructor', 'admin', 'auditor')
  async getContacts(
    @CurrentUser() currentUser: AuthenticatedUserContext,
    @Query('search') search?: string,
  ) {
    return createApiResponse(
      await this.messagingService.listContacts(currentUser, search),
      'Messaging contacts retrieved successfully.',
    );
  }

  @Post('threads')
  @Roles('student', 'instructor', 'admin', 'auditor')
  async createThread(
    @CurrentUser() currentUser: AuthenticatedUserContext,
    @Body() body: CreateThreadDto,
  ) {
    return createApiResponse(
      await this.messagingService.createThread(currentUser, body),
      'Messaging thread created successfully.',
    );
  }

  @Post('threads/:threadId/messages')
  @Roles('student', 'instructor', 'admin', 'auditor')
  async sendMessage(
    @CurrentUser() currentUser: AuthenticatedUserContext,
    @Param('threadId') threadId: string,
    @Body() body: SendMessageDto,
  ) {
    return createApiResponse(
      await this.messagingService.sendMessage(currentUser, threadId, body),
      'Messaging message sent successfully.',
    );
  }

  @Patch('threads/:threadId/read')
  @Roles('student', 'instructor', 'admin', 'auditor')
  async markThreadRead(
    @CurrentUser() currentUser: AuthenticatedUserContext,
    @Param('threadId') threadId: string,
    @Body() body: MarkThreadReadDto,
  ) {
    return createApiResponse(
      await this.messagingService.markThreadRead(currentUser, threadId, body),
      'Messaging thread marked as read successfully.',
    );
  }
}
