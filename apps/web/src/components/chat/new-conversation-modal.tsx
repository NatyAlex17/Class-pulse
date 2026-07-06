'use client';

import * as React from 'react';
import { IconBookmark, IconSearch, IconUserCircle } from '@tabler/icons-react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createMessagingThread, fetchMessagingContacts } from '@/lib/chat/api';
import { MessagingContact } from '@/lib/chat/types';
import { cn } from '@/lib/utils';

const SAVED_MESSAGES_ID = '__saved-messages__';

export interface NewConversationModalProps {
  open: boolean;
  onClose: () => void;
  accessToken: string | null | undefined;
  currentUserId: string;
  savedMessagesThreadId: string | null;
  onCreated: (threadId: string) => void;
}

export function NewConversationModal({
  open,
  onClose,
  accessToken,
  currentUserId,
  savedMessagesThreadId,
  onCreated,
}: NewConversationModalProps) {
  const [contacts, setContacts] = React.useState<MessagingContact[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [subject, setSubject] = React.useState('');
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setSelectedId(null);
      setSubject('');
      setSearch('');
      setError(null);
      return;
    }

    if (!accessToken) {
      setError('Sign in to start a new conversation.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchMessagingContacts(accessToken, search)
      .then((result) => {
        if (!cancelled) {
          setContacts(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load contacts.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, accessToken, search]);

  const handleCreate = async () => {
    if (!accessToken || !selectedId) {
      return;
    }

    if (selectedId === SAVED_MESSAGES_ID) {
      if (savedMessagesThreadId) {
        onCreated(savedMessagesThreadId);
        onClose();
        return;
      }

      setCreating(true);
      setError(null);

      try {
        const thread = await createMessagingThread(accessToken, {
          participantSupabaseUserIds: [currentUserId],
          subject: subject.trim() || 'Saved Messages',
        });
        onCreated(thread.id);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to open Saved Messages.');
      } finally {
        setCreating(false);
      }

      return;
    }

    setCreating(true);
    setError(null);

    try {
      const thread = await createMessagingThread(accessToken, {
        participantSupabaseUserIds: [selectedId],
        subject: subject.trim() || undefined,
      });
      onCreated(thread.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New conversation" description="Start a direct message" size="md">
      <div className="space-y-4">
        {error ? (
          <div className="rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">{error}</div>
        ) : null}

        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            placeholder="Search by email..."
            className="h-11 rounded-[14px] pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="max-h-64 space-y-2 overflow-y-auto">
          <button
            type="button"
            onClick={() => setSelectedId(SAVED_MESSAGES_ID)}
            className={cn(
              'flex w-full items-center gap-3 rounded-[14px] border p-3 text-left transition',
              selectedId === SAVED_MESSAGES_ID
                ? 'border-primary bg-primary/5'
                : 'border-border-subtle hover:border-primary/40 hover:bg-surface-muted',
            )}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <IconBookmark className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-on-surface">Saved Messages</p>
              <p className="text-xs text-on-surface-variant">Notes only you can see</p>
            </div>
            <Badge variant="neutral">You</Badge>
          </button>

          {loading ? (
            <p className="p-3 text-sm text-on-surface-variant">Loading contacts...</p>
          ) : contacts.length === 0 ? (
            <p className="p-3 text-sm text-on-surface-variant">No available contacts found.</p>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.supabaseUserId}
                type="button"
                onClick={() => setSelectedId(contact.supabaseUserId)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-[14px] border p-3 text-left transition',
                  selectedId === contact.supabaseUserId
                    ? 'border-primary bg-primary/5'
                    : 'border-border-subtle hover:border-primary/40 hover:bg-surface-muted',
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <IconUserCircle className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-on-surface">{contact.email}</p>
                </div>
                <Badge variant="neutral">{contact.role}</Badge>
              </button>
            ))
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
            Subject (optional)
          </label>
          <Input
            placeholder="What's this about?"
            className="h-11 rounded-[14px]"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void handleCreate()} disabled={!selectedId || creating}>
            {creating ? 'Starting...' : 'Start conversation'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
