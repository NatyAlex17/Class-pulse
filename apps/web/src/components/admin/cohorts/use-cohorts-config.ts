'use client';

import * as React from 'react';

import { useAuth } from '@/components/auth/auth-provider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type CohortDefinition = {
  id: string;
  name: string;
  description: string;
  moduleIds: string[];
  feeAmount: number;
  isOpen: boolean;
};

export type CohortsConfig = {
  cohorts: CohortDefinition[];
};

export type ModuleOption = {
  id: string;
  title: string;
};

export function useCohortsConfig() {
  const { session, syncedUser } = useAuth();
  const [config, setConfig] = React.useState<CohortsConfig | null>(null);
  const [moduleOptions, setModuleOptions] = React.useState<ModuleOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  // Snapshot of the config as last persisted to the API, so the debounced
  // auto-save only fires for genuine local mutations.
  const lastSavedRef = React.useRef<string | null>(null);

  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);

  const fetchConfig = React.useCallback(async () => {
    if (!session?.access_token) {
      setError('Sign in to manage cohorts.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const headers = {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };

      const [configResponse, modulesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admins/${adminId}/cohorts-config`, { headers, cache: 'no-store' }),
        fetch(`${API_BASE_URL}/admins/${adminId}/learning-resources-config`, { headers, cache: 'no-store' }),
      ]);

      if (configResponse.ok) {
        const payload = await configResponse.json();
        const data = payload.data ?? { cohorts: [] };
        lastSavedRef.current = JSON.stringify(data);
        setConfig(data);
      } else if (configResponse.status === 404 || configResponse.status === 401) {
        const emptyConfig = { cohorts: [] };
        lastSavedRef.current = JSON.stringify(emptyConfig);
        setConfig(emptyConfig);
      } else {
        throw new Error(`Failed to load cohorts configuration (${configResponse.status}).`);
      }

      if (modulesResponse.ok) {
        const payload = await modulesResponse.json();
        const modules = (payload.data?.modules ?? []) as Array<{ id: string; title: string }>;
        setModuleOptions(modules.map((module) => ({ id: module.id, title: module.title })));
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load cohorts configuration.');
    } finally {
      setLoading(false);
    }
  }, [adminId, session?.access_token]);

  React.useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  const saveConfig = React.useCallback(async () => {
    if (!config || !session?.access_token) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/cohorts-config`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to save cohorts configuration (${response.status}).`);
      }

      const payload = await response.json();
      lastSavedRef.current = JSON.stringify(payload.data);
      setConfig(payload.data);
      setSuccess('Cohorts configuration saved.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save cohorts configuration.');
    } finally {
      setSaving(false);
    }
  }, [adminId, config, session?.access_token]);

  // Persist a config immediately (fire-and-forget), mirroring the
  // learning-resources auto-save contract.
  const autoSaveConfig = React.useCallback(
    (newConfig: CohortsConfig) => {
      if (!session?.access_token) {
        setError('Sign in to save cohorts.');
        return;
      }

      const snapshot = JSON.stringify(newConfig);
      lastSavedRef.current = snapshot;

      void (async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/admins/${adminId}/cohorts-config`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: snapshot,
          });

          if (!response.ok) {
            const payload = await response.json().catch(() => null);
            throw new Error(payload?.error?.message ?? `Failed to save cohorts configuration (${response.status}).`);
          }
        } catch (saveError) {
          if (lastSavedRef.current === snapshot) {
            lastSavedRef.current = null;
          }
          setError(saveError instanceof Error ? saveError.message : 'Failed to save cohorts configuration.');
        }
      })();
    },
    [adminId, session?.access_token],
  );

  // Debounced auto-save for any local mutation.
  React.useEffect(() => {
    if (!config) {
      return;
    }

    if (JSON.stringify(config) === lastSavedRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      autoSaveConfig(config);
    }, 500);

    return () => clearTimeout(timer);
  }, [config, autoSaveConfig]);

  const resetConfig = React.useCallback(async () => {
    if (!session?.access_token) {
      return;
    }

    try {
      setResetting(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/cohorts-config/reset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to reset cohorts configuration (${response.status}).`);
      }

      const payload = await response.json();
      lastSavedRef.current = JSON.stringify(payload.data);
      setConfig(payload.data);
      setSuccess('Cohorts configuration reset to default.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Failed to reset cohorts configuration.');
    } finally {
      setResetting(false);
    }
  }, [adminId, session?.access_token]);

  return {
    config,
    setConfig,
    moduleOptions,
    loading,
    saving,
    resetting,
    error,
    success,
    setError,
    fetchConfig,
    saveConfig,
    resetConfig,
    autoSaveConfig,
  };
}

export type CohortsStore = ReturnType<typeof useCohortsConfig>;
