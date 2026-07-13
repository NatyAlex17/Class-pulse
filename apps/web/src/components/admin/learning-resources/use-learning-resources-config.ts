'use client';

import * as React from 'react';

import { useAuth } from '@/components/auth/auth-provider';

import type {
  LearningModule,
  LearningResource,
  LearningResourcesConfig,
  LearningSection,
} from './types';

const FALLBACK_API_BASE_URL = 'http://localhost:4000';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? FALLBACK_API_BASE_URL).replace(/\/$/, '');

function buildAdminApiUrl(adminId: string, path: string) {
  return `${API_BASE_URL}/admins/${adminId}${path}`;
}

function toRequestErrorMessage(error: unknown, action: string, url: string) {
  if (error instanceof TypeError) {
    return `Unable to ${action}. The admin API could not be reached at ${url}. Start the API server or set NEXT_PUBLIC_API_URL in apps/web/.env.`;
  }

  return error instanceof Error ? error.message : `Unable to ${action}.`;
}

export function useLearningResourcesConfig() {
  const { session, syncedUser } = useAuth();
  const [config, setConfig] = React.useState<LearningResourcesConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  // Snapshot of the config as last persisted to the API. The auto-save effect
  // compares against this so it only saves genuine local mutations (and never
  // re-saves data that just arrived from the server).
  const lastSavedRef = React.useRef<string | null>(null);

  const adminId = React.useMemo(
    () => syncedUser?.localUserId || 'admin-001',
    [syncedUser?.localUserId]
  );

  const fetchConfig = React.useCallback(async () => {
    if (!session?.access_token) {
      setError('Sign in to manage learning resources.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const requestUrl = buildAdminApiUrl(adminId, '/learning-resources-config');
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 401) {
          // Initialize with empty config if not found
          const emptyConfig = { modules: [], globalSettings: { minimumHoursForCertification: 0 } };
          lastSavedRef.current = JSON.stringify(emptyConfig);
          setConfig(emptyConfig);
        } else {
          throw new Error(`Failed to load configuration (${response.status}).`);
        }
        return;
      }

      const payload = await response.json();
      const data = payload.data || {
        modules: [],
        globalSettings: { minimumHoursForCertification: 0 },
      };
      lastSavedRef.current = JSON.stringify(data);
      setConfig(data);
    } catch (fetchError) {
      setError(
        toRequestErrorMessage(
          fetchError,
          'load learning resources configuration',
          buildAdminApiUrl(adminId, '/learning-resources-config')
        )
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
      const requestUrl = buildAdminApiUrl(adminId, '/learning-resources-config');
      const response = await fetch(requestUrl, {
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
          payload?.error?.message ?? `Failed to save configuration (${response.status}).`
        );
      }

      const payload = await response.json();
      lastSavedRef.current = JSON.stringify(payload.data);
      setConfig(payload.data);
      setSuccess('Learning management configuration saved.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (saveError) {
      setError(
        toRequestErrorMessage(
          saveError,
          'save learning resources configuration',
          buildAdminApiUrl(adminId, '/learning-resources-config')
        )
      );
    } finally {
      setSaving(false);
    }
  }, [adminId, config, session?.access_token]);

  // Persist a config to the API immediately (fire-and-forget). Marks the
  // snapshot as saved up front so the debounced effect doesn't double-save;
  // on failure it clears the snapshot so the next change (or manual Save) retries.
  const autoSaveConfig = React.useCallback(
    (newConfig: LearningResourcesConfig) => {
      if (!session?.access_token) {
        setError('Sign in to save learning resources.');
        return;
      }

      const snapshot = JSON.stringify(newConfig);
      lastSavedRef.current = snapshot;

      void (async () => {
        try {
          const requestUrl = buildAdminApiUrl(adminId, '/learning-resources-config');
          const response = await fetch(requestUrl, {
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
              payload?.error?.message ?? `Failed to save configuration (${response.status}).`
            );
          }
        } catch (saveError) {
          if (lastSavedRef.current === snapshot) {
            lastSavedRef.current = null;
          }
          setError(
            toRequestErrorMessage(
              saveError,
              'save learning resources configuration',
              buildAdminApiUrl(adminId, '/learning-resources-config')
            )
          );
        }
      })();
    },
    [adminId, session?.access_token]
  );

  // Auto-save any local mutation to the API (debounced). Deleting the last
  // module or section is a mutation too, so empty configs are saved as well.
  React.useEffect(() => {
    if (!config) {
      return;
    }

    if (JSON.stringify(config) === lastSavedRef.current) {
      return; // Already persisted (e.g. data that just arrived from the server).
    }

    const timer = setTimeout(() => {
      autoSaveConfig(config);
    }, 500); // Debounce for 500ms to avoid too many API calls

    return () => clearTimeout(timer);
  }, [config, autoSaveConfig]);

  const uploadFile = React.useCallback(
    async (file: File): Promise<string> => {
      if (!session?.access_token) {
        throw new Error('Sign in to upload files.');
      }

      const formData = new FormData();
      formData.append('file', file);

      const requestUrl = buildAdminApiUrl(adminId, '/learning-resources-config/upload');
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to upload file (${response.status}).`);
      }

      const payload = await response.json();
      const url = payload?.data?.url;

      if (typeof url !== 'string' || !url) {
        throw new Error('Upload succeeded but no file URL was returned.');
      }

      return url;
    },
    [adminId, session?.access_token]
  );

  const importConfigFile = React.useCallback(
    async (file: File) => {
      if (!session?.access_token) {
        throw new Error('Sign in to import learning resources.');
      }

      try {
        setImporting(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        const requestUrl = buildAdminApiUrl(adminId, '/learning-resources-config/import');
        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error?.message ?? `Failed to import configuration (${response.status}).`);
        }

        const payload = await response.json();
        const importedConfig = payload?.data?.config ?? payload?.data;
        const importedSummary = payload?.data?.summary;

        lastSavedRef.current = JSON.stringify(importedConfig);
        setConfig(importedConfig);
        setSuccess(
          importedSummary
            ? `Imported ${importedSummary.modules} modules, ${importedSummary.sections} lessons, and ${importedSummary.resources} learning activities.`
            : 'Learning resources imported successfully.',
        );
        setTimeout(() => setSuccess(null), 4000);

        return payload?.data;
      } catch (importError) {
        const requestUrl = buildAdminApiUrl(adminId, '/learning-resources-config/import');
        setError(toRequestErrorMessage(importError, 'import learning resources configuration', requestUrl));
        throw importError;
      } finally {
        setImporting(false);
      }
    },
    [adminId, session?.access_token]
  );

  const resetConfig = React.useCallback(async () => {
    if (!session?.access_token) {
      return;
    }

    try {
      setResetting(true);
      setError(null);
      const requestUrl = buildAdminApiUrl(adminId, '/learning-resources-config/reset');
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to reset configuration (${response.status}).`);
      }

      const payload = await response.json();
      lastSavedRef.current = JSON.stringify(payload.data);
      setConfig(payload.data);
      setSuccess('Learning management configuration reset to default.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (resetError) {
      setError(
        toRequestErrorMessage(
          resetError,
          'reset learning resources configuration',
          buildAdminApiUrl(adminId, '/learning-resources-config/reset')
        )
      );
    } finally {
      setResetting(false);
    }
  }, [adminId, session?.access_token]);

  const updateModule = React.useCallback(
    (targetModuleId: string, updater: (module: LearningModule) => LearningModule) => {
      setConfig((current) =>
        current
          ? {
              ...current,
              modules: current.modules.map((module) =>
                module.id === targetModuleId ? updater(module) : module
              ),
            }
          : current
      );
    },
    [setConfig]
  );

  const updateSection = React.useCallback(
    (
      targetModuleId: string,
      targetSectionId: string,
      updater: (section: LearningSection) => LearningSection
    ) => {
      updateModule(targetModuleId, (module) => ({
        ...module,
        sections: module.sections.map((section) =>
          section.id === targetSectionId ? updater(section) : section
        ),
      }));
    },
    [updateModule]
  );

  const updateResource = React.useCallback(
    (
      targetModuleId: string,
      targetSectionId: string,
      targetResourceId: string,
      updater: (resource: LearningResource) => LearningResource
    ) => {
      updateSection(targetModuleId, targetSectionId, (section) => ({
        ...section,
        resources: section.resources.map((resource) =>
          resource.id === targetResourceId ? updater(resource) : resource
        ),
      }));
    },
    [updateSection]
  );

  return {
    config,
    setConfig,
    loading,
    saving,
    resetting,
    importing,
    error,
    success,
    setError,
    setSuccess,
    fetchConfig,
    saveConfig,
    resetConfig,
    autoSaveConfig,
    uploadFile,
    importConfigFile,
    updateModule,
    updateSection,
    updateResource,
  };
}

export type LearningResourcesStore = ReturnType<typeof useLearningResourcesConfig>;
