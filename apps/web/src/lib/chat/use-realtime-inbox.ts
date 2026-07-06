'use client';

import * as React from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { getBrowserSupabaseClient } from '@/lib/supabase/browser-client';

import { ChatCurrentUser, ChatMessage, ChatParticipant, ChatThread, InboxSetupState } from './types';

type RawParticipantMembership = {
  user_id: string;
  participant_role: string;
  display_name: string | null;
};

type RawMessage = {
  id: string;
  sender_user_id: string;
  sender_role: string | null;
  body: string;
  created_at: string;
};

type RawThread = {
  id: string;
  subject: string | null;
  context_type: string | null;
  context_id: string | null;
  updated_at: string | null;
  chat_messages: RawMessage[] | null;
  chat_thread_participants: RawParticipantMembership[] | null;
};

type RawMembership = {
  thread_id: string;
  last_read_at: string | null;
  chat_threads: RawThread | RawThread[] | null;
};

type UseRealtimeInboxOptions = {
  fallbackCurrentUser: ChatCurrentUser;
  fallbackThreads: ChatThread[];
};

function formatPreview(messages: ChatMessage[]) {
  return messages[messages.length - 1]?.body ?? 'No messages yet.';
}

function deriveThreadTitle(thread: RawThread, participants: ChatParticipant[]) {
  if (thread.subject?.trim()) {
    return thread.subject.trim();
  }

  const counterpartNames = participants
    .filter((participant) => !participant.isCurrentUser)
    .map((participant) => participant.displayName);

  if (counterpartNames.length > 0) {
    return counterpartNames.join(', ');
  }

  return 'Conversation';
}

function deriveThreadSubtitle(thread: RawThread, participants: ChatParticipant[]) {
  const counterpartRoles = participants
    .filter((participant) => !participant.isCurrentUser)
    .map((participant) => participant.role)
    .filter(Boolean);

  if (participants.length === 1 && participants[0]?.isCurrentUser) {
    return 'Personal notes';
  }

  if (thread.context_type && thread.context_id) {
    return `${thread.context_type} / ${thread.context_id}`;
  }

  if (counterpartRoles.length > 0) {
    return counterpartRoles.join(', ');
  }

  return 'Operational messaging';
}

function normalizeRole(value: unknown, fallbackRole: string) {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : fallbackRole;
}

function sortThreads(threads: ChatThread[]) {
  return [...threads].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function sortMessages(messages: ChatMessage[]) {
  return [...messages].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
}

export function useRealtimeInbox({
  fallbackCurrentUser,
  fallbackThreads,
}: UseRealtimeInboxOptions) {
  const [threads, setThreads] = React.useState<ChatThread[]>(sortThreads(fallbackThreads));
  const [activeThreadId, setActiveThreadId] = React.useState(fallbackThreads[0]?.id ?? '');
  const [composerValue, setComposerValue] = React.useState('');
  const [currentUser, setCurrentUser] = React.useState<ChatCurrentUser>(fallbackCurrentUser);
  const [setupState, setSetupState] = React.useState<InboxSetupState>({
    mode: 'demo',
    statusMessage: 'Using guided demo data until Supabase chat setup is complete.',
    isLoading: true,
    sendPending: false,
    errorMessage: null,
  });
  const supabase = React.useMemo(() => getBrowserSupabaseClient(), []);

  const hydrateThreads = React.useCallback(
    async (user: ChatCurrentUser) => {
      if (!supabase) {
        return;
      }

      const { data, error } = await supabase
        .from('chat_thread_participants')
        .select(
          `
            thread_id,
            last_read_at,
            chat_threads (
              id,
              subject,
              context_type,
              context_id,
              updated_at,
              chat_messages (
                id,
                sender_user_id,
                sender_role,
                body,
                created_at
              ),
              chat_thread_participants (
                user_id,
                participant_role,
                display_name
              )
            )
          `,
        )
        .eq('user_id', user.id);

      if (error) {
        setThreads(sortThreads(fallbackThreads));
        setActiveThreadId((current) => current || fallbackThreads[0]?.id || '');
        setSetupState({
          mode: 'demo',
          statusMessage: 'Supabase chat query failed, so the inbox fell back to demo data.',
          isLoading: false,
          sendPending: false,
          errorMessage: error.message,
        });
        return;
      }

      const mappedThreads = ((data ?? []) as RawMembership[])
        .map((membership) => {
          const rawThread = Array.isArray(membership.chat_threads)
            ? membership.chat_threads[0]
            : membership.chat_threads;

          if (!rawThread) {
            return null;
          }

          const participants = (rawThread.chat_thread_participants ?? []).map((participant) => ({
            userId: participant.user_id,
            displayName: participant.display_name?.trim() || participant.user_id,
            role: participant.participant_role || 'participant',
            isCurrentUser: participant.user_id === user.id,
          }));

          const messages = sortMessages(
            (rawThread.chat_messages ?? []).map((message) => ({
              id: message.id,
              senderUserId: message.sender_user_id,
              senderRole: message.sender_role ?? 'participant',
              body: message.body,
              createdAt: message.created_at,
              isCurrentUser: message.sender_user_id === user.id,
            })),
          );

          const lastReadAt = membership.last_read_at ? new Date(membership.last_read_at).getTime() : 0;
          const unreadCount = messages.filter(
            (message) =>
              !message.isCurrentUser && new Date(message.createdAt).getTime() > lastReadAt,
          ).length;
          const updatedAt =
            messages[messages.length - 1]?.createdAt ??
            rawThread.updated_at ??
            new Date().toISOString();

          return {
            id: rawThread.id,
            title: deriveThreadTitle(rawThread, participants),
            subtitle: deriveThreadSubtitle(rawThread, participants),
            updatedAt,
            preview: formatPreview(messages),
            unreadCount,
            participants,
            messages,
          } satisfies ChatThread;
        })
        .filter((thread): thread is ChatThread => thread !== null);

      setThreads(sortThreads(mappedThreads));
      setActiveThreadId((current) => current || mappedThreads[0]?.id || '');
      setSetupState({
        mode: 'supabase',
        statusMessage: 'Live Supabase chat is connected.',
        isLoading: false,
        sendPending: false,
        errorMessage: null,
      });
    },
    [fallbackThreads, supabase],
  );

  React.useEffect(() => {
    if (!supabase) {
      setThreads(sortThreads(fallbackThreads));
      setActiveThreadId(fallbackThreads[0]?.id ?? '');
      setSetupState({
        mode: 'demo',
        statusMessage: 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to use live chat.',
        isLoading: false,
        sendPending: false,
        errorMessage: null,
      });
      return;
    }

    let isActive = true;
    let channel: RealtimeChannel | null = null;

    const bootstrap = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!isActive) {
        return;
      }

      if (error || !data.user) {
        setThreads(sortThreads(fallbackThreads));
        setActiveThreadId(fallbackThreads[0]?.id ?? '');
        setCurrentUser(fallbackCurrentUser);
        setSetupState({
          mode: 'demo',
          statusMessage: 'Sign in through Supabase Auth to load live inbox threads.',
          isLoading: false,
          sendPending: false,
          errorMessage: error?.message ?? null,
        });
        return;
      }

      const nextUser: ChatCurrentUser = {
        id: data.user.id,
        displayName:
          typeof data.user.user_metadata?.full_name === 'string' &&
          data.user.user_metadata.full_name.trim()
            ? data.user.user_metadata.full_name.trim()
            : data.user.email ?? fallbackCurrentUser.displayName,
        role: normalizeRole(data.user.user_metadata?.role, fallbackCurrentUser.role),
      };

      setCurrentUser(nextUser);
      await hydrateThreads(nextUser);

      if (!isActive) {
        return;
      }

      channel = supabase
        .channel(`chat-inbox-${nextUser.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'chat_messages' },
          () => void hydrateThreads(nextUser),
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'chat_thread_participants' },
          () => void hydrateThreads(nextUser),
        )
        .subscribe();
    };

    void bootstrap();

    return () => {
      isActive = false;
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [fallbackCurrentUser, fallbackThreads, hydrateThreads, supabase]);

  const activeThread =
    threads.find((thread) => thread.id === activeThreadId) ?? threads[0] ?? null;

  const markThreadRead = React.useCallback(
    async (threadId: string) => {
      if (!supabase || setupState.mode !== 'supabase') {
        return;
      }

      await supabase
        .from('chat_thread_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .eq('user_id', currentUser.id);
    },
    [currentUser.id, setupState.mode, supabase],
  );

  const selectThread = React.useCallback(
    (threadId: string) => {
      setActiveThreadId(threadId);
      setThreads((current) =>
        current.map((thread) =>
          thread.id === threadId ? { ...thread, unreadCount: 0 } : thread,
        ),
      );
      void markThreadRead(threadId);
    },
    [markThreadRead],
  );

  const sendMessage = React.useCallback(async () => {
    const trimmed = composerValue.trim();
    if (!trimmed || !activeThread) {
      return;
    }

    if (!supabase || setupState.mode !== 'supabase') {
      const optimisticMessage: ChatMessage = {
        id: `${activeThread.id}-${Date.now()}`,
        senderUserId: currentUser.id,
        senderRole: currentUser.role,
        body: trimmed,
        createdAt: new Date().toISOString(),
        isCurrentUser: true,
      };

      setThreads((current) =>
        sortThreads(
          current.map((thread) =>
            thread.id === activeThread.id
              ? {
                  ...thread,
                  preview: optimisticMessage.body,
                  updatedAt: optimisticMessage.createdAt,
                  messages: [...thread.messages, optimisticMessage],
                }
              : thread,
          ),
        ),
      );
      setComposerValue('');
      return;
    }

    setSetupState((current) => ({
      ...current,
      sendPending: true,
      errorMessage: null,
    }));

    const { error } = await supabase.from('chat_messages').insert({
      thread_id: activeThread.id,
      sender_user_id: currentUser.id,
      sender_role: currentUser.role,
      body: trimmed,
    });

    if (error) {
      setSetupState((current) => ({
        ...current,
        sendPending: false,
        errorMessage: error.message,
      }));
      return;
    }

    await markThreadRead(activeThread.id);
    await hydrateThreads(currentUser);
    setComposerValue('');
    setSetupState((current) => ({
      ...current,
      sendPending: false,
      errorMessage: null,
    }));
  }, [
    activeThread,
    composerValue,
    currentUser,
    hydrateThreads,
    markThreadRead,
    setupState.mode,
    supabase,
  ]);

  const refresh = React.useCallback(
    async (selectThreadId?: string) => {
      if (setupState.mode !== 'supabase') {
        return;
      }

      await hydrateThreads(currentUser);

      if (selectThreadId) {
        setActiveThreadId(selectThreadId);
      }
    },
    [currentUser, hydrateThreads, setupState.mode],
  );

  return {
    threads,
    activeThread,
    activeThreadId,
    selectThread,
    composerValue,
    setComposerValue,
    sendMessage,
    currentUser,
    setupState,
    refresh,
  };
}
