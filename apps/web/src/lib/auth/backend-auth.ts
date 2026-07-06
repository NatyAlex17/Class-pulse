import { getRoleRoute, normalizeAppRole, type AppRole } from './role-route';

export interface BackendSyncedUser {
  localUserId: string;
  supabaseUserId: string;
  email: string;
  role: AppRole;
  status: string;
  redirectPath: string;
}

interface AuthMeResponse {
  success: true;
  data: {
    authUser: {
      id: string;
      email: string | null;
    };
    localUser: {
      id: string;
      supabaseUserId: string;
      email: string;
      role: string;
      status: string;
    };
  };
}

export async function syncAuthenticatedUser(accessToken: string): Promise<BackendSyncedUser> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    let errorMessage = 'Failed to sync authenticated user.';

    try {
      const payload = (await response.json()) as { error?: { message?: string } };
      errorMessage = payload.error?.message ?? errorMessage;
    } catch {
      // Keep the generic message when the response is not JSON.
    }

    throw new Error(errorMessage);
  }

  const payload = (await response.json()) as AuthMeResponse;
  const role = normalizeAppRole(payload.data.localUser.role);

  return {
    localUserId: payload.data.localUser.id,
    supabaseUserId: payload.data.authUser.id,
    email: payload.data.localUser.email,
    role,
    status: payload.data.localUser.status,
    redirectPath: getRoleRoute(role),
  };
}
