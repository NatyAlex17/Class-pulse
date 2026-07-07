'use client';

import * as React from 'react';

import { useAuth } from '@/components/auth/auth-provider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type DocumentAppliesTo = 'student' | 'instructor' | 'both';

export type DocumentRequirementDefinition = {
  id: string;
  name: string;
  description: string;
  appliesTo: DocumentAppliesTo;
  required: boolean;
};

export type DocumentRequirementsConfig = {
  documents: DocumentRequirementDefinition[];
};

export function useDocumentRequirementsConfig() {
  const { session, syncedUser } = useAuth();
  const [config, setConfig] = React.useState<DocumentRequirementsConfig | null>(null);
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
      setError('Sign in to manage document requirements.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/document-requirements-config`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const payload = await response.json();
        const data = payload.data ?? { documents: [] };
        lastSavedRef.current = JSON.stringify(data);
        setConfig(data);
      } else if (response.status === 404 || response.status === 401) {
        const emptyConfig = { documents: [] };
        lastSavedRef.current = JSON.stringify(emptyConfig);
        setConfig(emptyConfig);
      } else {
        throw new Error(`Failed to load document requirements configuration (${response.status}).`);
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      setError(
        fetchError instanceof Error ? fetchError.message : 'Failed to load document requirements configuration.',
      );
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
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/document-requirements-config`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          payload?.error?.message ?? `Failed to save document requirements configuration (${response.status}).`,
        );
      }

      const payload = await response.json();
      lastSavedRef.current = JSON.stringify(payload.data);
      setConfig(payload.data);
      setSuccess('Document requirements configuration saved.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Failed to save document requirements configuration.',
      );
    } finally {
      setSaving(false);
    }
  }, [adminId, config, session?.access_token]);

  // Persist a config immediately (fire-and-forget), mirroring the
  // learning-resources auto-save contract.
  const autoSaveConfig = React.useCallback(
    (newConfig: DocumentRequirementsConfig) => {
      if (!session?.access_token) {
        setError('Sign in to save document requirements.');
        return;
      }

      const snapshot = JSON.stringify(newConfig);
      lastSavedRef.current = snapshot;

      void (async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/admins/${adminId}/document-requirements-config`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: snapshot,
          });

          if (!response.ok) {
            const payload = await response.json().catch(() => null);
            throw new Error(
              payload?.error?.message ?? `Failed to save document requirements configuration (${response.status}).`,
            );
          }
        } catch (saveError) {
          if (lastSavedRef.current === snapshot) {
            lastSavedRef.current = null;
          }
          setError(
            saveError instanceof Error ? saveError.message : 'Failed to save document requirements configuration.',
          );
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
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/document-requirements-config/reset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to reset document requirements configuration (${response.status}).`);
      }

      const payload = await response.json();
      lastSavedRef.current = JSON.stringify(payload.data);
      setConfig(payload.data);
      setSuccess('Document requirements configuration reset to default.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (resetError) {
      setError(
        resetError instanceof Error ? resetError.message : 'Failed to reset document requirements configuration.',
      );
    } finally {
      setResetting(false);
    }
  }, [adminId, session?.access_token]);

  return {
    config,
    setConfig,
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

export type DocumentRequirementsStore = ReturnType<typeof useDocumentRequirementsConfig>;
