'use client';

import * as React from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

import { getBrowserSupabaseClient } from '@/lib/supabase/browser-client';

export interface UnreadNotification {
  id: string;
  senderRole: string;
  body: string;
  threadId: string;
}

function formatSenderRole(role: string | null | undefined) {
  const normalized = (role ?? 'participant').trim() || 'participant';
  return `New message from a${['a', 'e', 'i', 'o', 'u'].includes(normalized[0]) ? 'n' : ''} ${normalized}`;
}

export function useUnreadMessagesCount() {
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notification, setNotification] = React.useState<UnreadNotification | null>(null);
  const supabase = React.useMemo(() => getBrowserSupabaseClient(), []);
  const userIdRef = React.useRef<string | null>(null);

  const computeUnread = React.useCallback(
    async (userId: string) => {
      if (!supabase) {
        return;
      }

      const { data: memberships } = await supabase
        .from('chat_thread_participants')
        .select('thread_id, last_read_at')
        .eq('user_id', userId);

      if (!memberships || memberships.length === 0) {
        setUnreadCount(0);
        return;
      }

      const threadIds = memberships.map((membership) => membership.thread_id);
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('thread_id, sender_user_id, created_at')
        .in('thread_id', threadIds)
        .neq('sender_user_id', userId);

      const lastReadByThread = new Map(
        memberships.map((membership) => [
          membership.thread_id,
          membership.last_read_at ? new Date(membership.last_read_at).getTime() : 0,
        ]),
      );

      const unread = (messages ?? []).filter(
        (message) => new Date(message.created_at).getTime() > (lastReadByThread.get(message.thread_id) ?? 0),
      );

      setUnreadCount(unread.length);
    },
    [supabase],
  );

  React.useEffect(() => {
    if (!supabase) {
      return;
    }

    let isActive = true;
    let channel: RealtimeChannel | null = null;

    const bootstrap = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!isActive || error || !data.user) {
        return;
      }

      userIdRef.current = data.user.id;
      await computeUnread(data.user.id);

      if (!isActive) {
        return;
      }

      channel = supabase
        .channel(`unread-badge-${data.user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
          (payload) => {
            const row = payload.new as { thread_id: string; sender_user_id: string; sender_role: string; body: string };

            if (!userIdRef.current || row.sender_user_id === userIdRef.current) {
              return;
            }

            setNotification({
              id: `${row.thread_id}-${Date.now()}`,
              senderRole: formatSenderRole(row.sender_role),
              body: row.body,
              threadId: row.thread_id,
            });
            void computeUnread(userIdRef.current);
          },
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'chat_thread_participants' },
          () => {
            if (userIdRef.current) {
              void computeUnread(userIdRef.current);
            }
          },
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
  }, [computeUnread, supabase]);

  const dismissNotification = React.useCallback(() => setNotification(null), []);

  return { unreadCount, notification, dismissNotification };
}
