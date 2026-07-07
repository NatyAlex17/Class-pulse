import { MessagingContact } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface ApiEnvelope<TData> {
  data: TData;
  message?: string;
}

async function callMessagingApi<TData>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<TData> {
  const response = await fetch(`${API_BASE_URL}/messaging${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = 'Messaging request failed.';

    try {
      const payload = (await response.json()) as { error?: { message?: string }; message?: string };
      message = payload.error?.message ?? payload.message ?? message;
    } catch {
      // Keep the generic message when the response body is not JSON.
    }

    throw new Error(message);
  }

  const payload = (await response.json()) as ApiEnvelope<TData>;
  return payload.data;
}

export function fetchMessagingContacts(accessToken: string, search?: string): Promise<MessagingContact[]> {
  const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  return callMessagingApi<MessagingContact[]>(`/contacts${query}`, accessToken, { method: 'GET' });
}

export function createMessagingThread(
  accessToken: string,
  payload: { participantSupabaseUserIds: string[]; subject?: string; contextType?: string },
): Promise<{ id: string }> {
  return callMessagingApi<{ id: string }>('/threads', accessToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
