import { randomUUID } from 'crypto';

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { AuthenticatedUserContext } from '../../../common/auth/authenticated-request.interface';
import { AuditLogService } from '../../../common/services/audit-log.service';
import { SupabaseService } from '../../auth/services/supabase.service';
import { CreateThreadDto, MarkThreadReadDto, MessagingThreadResponse, SendMessageDto } from '../types/messaging.types';

interface SupabaseThreadRow {
  id: string;
  subject: string | null;
  context_type: string | null;
  context_id: string | null;
  updated_at: string;
}

interface SupabaseParticipantRow {
  thread_id: string;
  user_id: string;
  participant_role: string;
  display_name: string | null;
  last_read_at: string | null;
}

interface SupabaseMessageRow {
  id: string;
  thread_id: string;
  sender_user_id: string;
  sender_role: string;
  body: string;
  created_at: string;
}

@Injectable()
export class MessagingService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async listThreadsForUser(currentUser: AuthenticatedUserContext): Promise<MessagingThreadResponse[]> {
    const [participantsResult, threadsResult, messagesResult] = await Promise.all([
      this.supabaseService.adminClient
        .from('chat_thread_participants')
        .select('thread_id, user_id, participant_role, display_name, last_read_at')
        .eq('user_id', currentUser.authUser.id),
      this.supabaseService.adminClient
        .from('chat_thread_participants')
        .select('thread_id, user_id, participant_role, display_name, last_read_at')
        .in(
          'thread_id',
          (
            await this.supabaseService.adminClient
              .from('chat_thread_participants')
              .select('thread_id')
              .eq('user_id', currentUser.authUser.id)
          ).data?.map((row) => row.thread_id) ?? ['00000000-0000-0000-0000-000000000000'],
        ),
      this.supabaseService.adminClient
        .from('chat_messages')
        .select('id, thread_id, sender_user_id, sender_role, body, created_at')
        .in(
          'thread_id',
          (
            await this.supabaseService.adminClient
              .from('chat_thread_participants')
              .select('thread_id')
              .eq('user_id', currentUser.authUser.id)
          ).data?.map((row) => row.thread_id) ?? ['00000000-0000-0000-0000-000000000000'],
        )
        .order('created_at', { ascending: true }),
    ]);

    if (participantsResult.error || threadsResult.error || messagesResult.error) {
      throw new BadRequestException(
        participantsResult.error?.message ||
          threadsResult.error?.message ||
          messagesResult.error?.message ||
          'Failed to load messaging threads.',
      );
    }

    const threadIds = [...new Set((participantsResult.data ?? []).map((row) => row.thread_id))];
    if (threadIds.length === 0) {
      return [];
    }

    const threadRowsResult = await this.supabaseService.adminClient
      .from('chat_threads')
      .select('id, subject, context_type, context_id, updated_at')
      .in('id', threadIds)
      .order('updated_at', { ascending: false });

    if (threadRowsResult.error) {
      throw new BadRequestException(threadRowsResult.error.message);
    }

    return this.mapThreads({
      currentSupabaseUserId: currentUser.authUser.id,
      threadRows: (threadRowsResult.data ?? []) as SupabaseThreadRow[],
      participantRows: (threadsResult.data ?? []) as SupabaseParticipantRow[],
      messageRows: (messagesResult.data ?? []) as SupabaseMessageRow[],
      currentUserMemberships: (participantsResult.data ?? []) as SupabaseParticipantRow[],
    });
  }

  async createThread(currentUser: AuthenticatedUserContext, body: CreateThreadDto) {
    if (!Array.isArray(body.participantSupabaseUserIds) || body.participantSupabaseUserIds.length === 0) {
      throw new BadRequestException('participantSupabaseUserIds must include at least one participant.');
    }

    const participantIds = [...new Set([currentUser.authUser.id, ...body.participantSupabaseUserIds])];
    const threadInsert = await this.supabaseService.adminClient
      .from('chat_threads')
      .insert({
        subject: body.subject?.trim() || null,
        context_type: body.contextType ?? 'general',
        context_id: body.contextId?.trim() || null,
        created_by_user_id: currentUser.authUser.id,
      })
      .select('id, subject, context_type, context_id, updated_at')
      .single();

    if (threadInsert.error || !threadInsert.data) {
      throw new BadRequestException(threadInsert.error?.message ?? 'Failed to create thread.');
    }

    const participantInsert = await this.supabaseService.adminClient
      .from('chat_thread_participants')
      .insert(
        participantIds.map((participantId) => ({
          thread_id: threadInsert.data.id,
          user_id: participantId,
          participant_role: participantId === currentUser.authUser.id ? currentUser.localUser.role : 'student',
          display_name: participantId === currentUser.authUser.id ? currentUser.localUser.email : null,
          last_read_at: participantId === currentUser.authUser.id ? new Date().toISOString() : null,
        })),
      );

    if (participantInsert.error) {
      throw new BadRequestException(participantInsert.error.message);
    }

    await this.auditLogService.record({
      actorUserId: currentUser.localUser.id,
      actionType: 'chat_thread_created',
      targetEntityType: 'chat_thread',
      targetEntityId: threadInsert.data.id,
      afterValue: threadInsert.data,
      context: {
        participantSupabaseUserIds: participantIds,
      },
    });

    const threads = await this.listThreadsForUser(currentUser);
    const thread = threads.find((item) => item.id === threadInsert.data.id);
    if (!thread) {
      throw new NotFoundException('Created thread could not be loaded.');
    }

    return thread;
  }

  async sendMessage(currentUser: AuthenticatedUserContext, threadId: string, body: SendMessageDto) {
    const messageBody = body.body?.trim();
    if (!messageBody) {
      throw new BadRequestException('Message body is required.');
    }

    await this.ensureParticipant(threadId, currentUser.authUser.id);

    const messageInsert = await this.supabaseService.adminClient
      .from('chat_messages')
      .insert({
        thread_id: threadId,
        sender_user_id: currentUser.authUser.id,
        sender_role: currentUser.localUser.role,
        body: messageBody,
      })
      .select('id, thread_id, sender_user_id, sender_role, body, created_at')
      .single();

    if (messageInsert.error || !messageInsert.data) {
      throw new BadRequestException(messageInsert.error?.message ?? 'Failed to send message.');
    }

    await this.supabaseService.adminClient
      .from('chat_thread_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('thread_id', threadId)
      .eq('user_id', currentUser.authUser.id);

    await this.auditLogService.record({
      actorUserId: currentUser.localUser.id,
      actionType: 'chat_message_sent',
      targetEntityType: 'chat_message',
      targetEntityId: messageInsert.data.id,
      afterValue: messageInsert.data,
      context: {
        threadId,
      },
    });

    return {
      id: messageInsert.data.id,
      senderSupabaseUserId: messageInsert.data.sender_user_id,
      senderRole: messageInsert.data.sender_role,
      body: messageInsert.data.body,
      createdAt: messageInsert.data.created_at,
      isCurrentUser: true,
    };
  }

  async markThreadRead(currentUser: AuthenticatedUserContext, threadId: string, body: MarkThreadReadDto) {
    await this.ensureParticipant(threadId, currentUser.authUser.id);

    const readAt = body.readAt?.trim() || new Date().toISOString();
    const updateResult = await this.supabaseService.adminClient
      .from('chat_thread_participants')
      .update({ last_read_at: readAt })
      .eq('thread_id', threadId)
      .eq('user_id', currentUser.authUser.id)
      .select('thread_id, user_id, last_read_at')
      .single();

    if (updateResult.error || !updateResult.data) {
      throw new BadRequestException(updateResult.error?.message ?? 'Failed to mark thread as read.');
    }

    await this.auditLogService.record({
      actorUserId: currentUser.localUser.id,
      actionType: 'chat_thread_marked_read',
      targetEntityType: 'chat_thread',
      targetEntityId: threadId,
      afterValue: updateResult.data,
      context: {
        readAt,
      },
    });

    return updateResult.data;
  }

  private async ensureParticipant(threadId: string, supabaseUserId: string) {
    const result = await this.supabaseService.adminClient
      .from('chat_thread_participants')
      .select('thread_id, user_id')
      .eq('thread_id', threadId)
      .eq('user_id', supabaseUserId)
      .maybeSingle();

    if (result.error) {
      throw new BadRequestException(result.error.message);
    }

    if (!result.data) {
      throw new NotFoundException('Messaging thread not found for the current user.');
    }
  }

  private mapThreads(input: {
    currentSupabaseUserId: string;
    threadRows: SupabaseThreadRow[];
    participantRows: SupabaseParticipantRow[];
    messageRows: SupabaseMessageRow[];
    currentUserMemberships: SupabaseParticipantRow[];
  }): MessagingThreadResponse[] {
    return input.threadRows.map((thread) => {
      const participants = input.participantRows
        .filter((row) => row.thread_id === thread.id)
        .map((row) => ({
          supabaseUserId: row.user_id,
          displayName: row.display_name ?? row.user_id,
          role: row.participant_role,
          isCurrentUser: row.user_id === input.currentSupabaseUserId,
        }));

      const messages = input.messageRows
        .filter((row) => row.thread_id === thread.id)
        .map((row) => ({
          id: row.id,
          senderSupabaseUserId: row.sender_user_id,
          senderRole: row.sender_role,
          body: row.body,
          createdAt: row.created_at,
          isCurrentUser: row.sender_user_id === input.currentSupabaseUserId,
        }));

      const currentMembership = input.currentUserMemberships.find((row) => row.thread_id === thread.id);
      const lastReadAt = currentMembership?.last_read_at ? new Date(currentMembership.last_read_at).getTime() : 0;
      const unreadCount = messages.filter(
        (message) => !message.isCurrentUser && new Date(message.createdAt).getTime() > lastReadAt,
      ).length;

      return {
        id: thread.id,
        subject: thread.subject ?? 'Conversation',
        contextType: thread.context_type,
        contextId: thread.context_id,
        updatedAt: thread.updated_at,
        participants,
        messages,
        unreadCount,
      };
    });
  }
}
