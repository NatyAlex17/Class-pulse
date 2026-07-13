'use client';

import * as React from 'react';

import { useAuth } from '@/components/auth/auth-provider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type CdphE276ProviderType = 'Educational Institution' | 'Skilled Nursing Facility' | 'Intermediate Care Facility';

export type CdphE276ApplicationType =
  | 'Online NATP'
  | 'Online Alternative NATP Type I'
  | 'Online Alternative NATP Type II';

export type CdphE276ProgramType = 'Synchronous' | 'Asynchronous';

export type CdphE276ProgramProfile = {
  providerName: string;
  mailingAddress: string;
  county: string;
  phoneNumber: string;
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  providerType: CdphE276ProviderType;
  applicationType: CdphE276ApplicationType;
  programType: CdphE276ProgramType;
  providerLandingPageUrl: string;
  learningManagementSystemUrl: string;
  programLength: string;
  curriculumNameEditionYear: string;
  studentFees: string;
};

export type CdphE276ModuleHoursRow = {
  id: string;
  title: string;
  theoryHours: number;
  clinicalHours: number;
};

export function useCdphE276() {
  const { session, syncedUser } = useAuth();
  const [profile, setProfile] = React.useState<CdphE276ProgramProfile | null>(null);
  const [moduleHours, setModuleHours] = React.useState<CdphE276ModuleHoursRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const adminId = React.useMemo(() => syncedUser?.localUserId || 'admin-001', [syncedUser?.localUserId]);

  const fetchProfile = React.useCallback(async () => {
    if (!session?.access_token) {
      setError('Sign in to manage the CDPH E276 program profile.');
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

      const [profileResponse, modulesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/admins/${adminId}/cdph/e276`, { headers, cache: 'no-store' }),
        fetch(`${API_BASE_URL}/admins/${adminId}/learning-resources-config`, { headers, cache: 'no-store' }),
      ]);

      if (!profileResponse.ok) {
        throw new Error(`Failed to load the CDPH E276 program profile (${profileResponse.status}).`);
      }

      const profilePayload = await profileResponse.json();
      setProfile(profilePayload.data);

      if (modulesResponse.ok) {
        const modulesPayload = await modulesResponse.json();
        const modules = (modulesPayload.data?.modules ?? []) as Array<{
          id: string;
          title: string;
          order: number;
          requiredHours: number;
          minimumClinicalHours?: number;
        }>;
        setModuleHours(
          modules
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((module) => ({
              id: module.id,
              title: module.title,
              theoryHours: module.requiredHours,
              clinicalHours: module.minimumClinicalHours ?? 0,
            })),
        );
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load the CDPH E276 program profile.');
    } finally {
      setLoading(false);
    }
  }, [adminId, session?.access_token]);

  React.useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const saveProfile = React.useCallback(async () => {
    if (!profile || !session?.access_token) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/cdph/e276`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? `Failed to save the CDPH E276 program profile (${response.status}).`);
      }

      const payload = await response.json();
      setProfile(payload.data);
      setSuccess('CDPH E276 program profile saved.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save the CDPH E276 program profile.');
    } finally {
      setSaving(false);
    }
  }, [adminId, profile, session?.access_token]);

  const downloadPdf = React.useCallback(async () => {
    if (!session?.access_token) {
      setError('Sign in to generate the CDPH E276 PDF.');
      return;
    }

    try {
      setDownloading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/admins/${adminId}/cdph/e276/pdf`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to generate the CDPH E276 PDF (${response.status}).`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cdph-e276.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Failed to generate the CDPH E276 PDF.');
    } finally {
      setDownloading(false);
    }
  }, [adminId, session?.access_token]);

  return {
    profile,
    setProfile,
    moduleHours,
    loading,
    saving,
    downloading,
    error,
    success,
    fetchProfile,
    saveProfile,
    downloadPdf,
  };
}
