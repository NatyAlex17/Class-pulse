'use client';

import * as React from 'react';
import { IconDownload, IconDeviceFloppy } from '@tabler/icons-react';

import { AdminShell } from '@/components/admin/admin-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

import { ConfigBanner } from '../learning-resources/shared';
import { useCdphE276, type CdphE276ProgramProfile } from './use-cdph-e276';

function updateField<TKey extends keyof CdphE276ProgramProfile>(
  setProfile: React.Dispatch<React.SetStateAction<CdphE276ProgramProfile | null>>,
  key: TKey,
  value: CdphE276ProgramProfile[TKey],
) {
  setProfile((current) => (current ? { ...current, [key]: value } : current));
}

export function CdphE276View() {
  const { profile, setProfile, moduleHours, loading, saving, downloading, error, success, saveProfile, downloadPdf } =
    useCdphE276();

  if (loading) {
    return (
      <AdminShell title="CDPH E276" subtitle="Loading the online NATP program profile.">
        <div className="p-8 text-center">Loading program profile...</div>
      </AdminShell>
    );
  }

  if (!profile) {
    return (
      <AdminShell title="CDPH E276" subtitle="Online Nurse Assistant Training Program application.">
        <ConfigBanner error={error} success={success} />
      </AdminShell>
    );
  }

  const totalTheoryHours = moduleHours.reduce((sum, module) => sum + module.theoryHours, 0);
  const totalClinicalHours = moduleHours.reduce((sum, module) => sum + module.clinicalHours, 0);

  return (
    <AdminShell
      title="CDPH E276"
      subtitle="Online Nurse Assistant Training Program application — filed once per program, updated when program details change."
    >
      <div className="space-y-6">
        <ConfigBanner error={error} success={success} />

        <section className="rounded-[20px] border border-border-subtle bg-surface p-6">
          <h3 className="font-display text-[18px] font-semibold text-on-surface mb-4">Provider Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              value={profile.providerName}
              onChange={(event) => updateField(setProfile, 'providerName', event.target.value)}
              placeholder="Provider name"
              className="h-11 rounded-[14px]"
            />
            <Input
              value={profile.county}
              onChange={(event) => updateField(setProfile, 'county', event.target.value)}
              placeholder="County"
              className="h-11 rounded-[14px]"
            />
            <Input
              value={profile.mailingAddress}
              onChange={(event) => updateField(setProfile, 'mailingAddress', event.target.value)}
              placeholder="Mailing address"
              className="h-11 rounded-[14px] sm:col-span-2"
            />
            <Input
              value={profile.phoneNumber}
              onChange={(event) => updateField(setProfile, 'phoneNumber', event.target.value)}
              placeholder="Phone number"
              className="h-11 rounded-[14px]"
            />
            <Input
              value={profile.contactPersonName}
              onChange={(event) => updateField(setProfile, 'contactPersonName', event.target.value)}
              placeholder="Provider's contact person name"
              className="h-11 rounded-[14px]"
            />
            <Input
              value={profile.contactPersonPhone}
              onChange={(event) => updateField(setProfile, 'contactPersonPhone', event.target.value)}
              placeholder="Contact person's phone number"
              className="h-11 rounded-[14px]"
            />
            <Input
              value={profile.contactPersonEmail}
              onChange={(event) => updateField(setProfile, 'contactPersonEmail', event.target.value)}
              placeholder="Contact person's email address"
              className="h-11 rounded-[14px]"
            />
          </div>
        </section>

        <section className="rounded-[20px] border border-border-subtle bg-surface p-6">
          <h3 className="font-display text-[18px] font-semibold text-on-surface mb-4">Program Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              value={profile.providerType}
              onChange={(event) => updateField(setProfile, 'providerType', event.target.value as CdphE276ProgramProfile['providerType'])}
              options={[
                { label: 'Educational Institution', value: 'Educational Institution' },
                { label: 'Skilled Nursing Facility', value: 'Skilled Nursing Facility' },
                { label: 'Intermediate Care Facility', value: 'Intermediate Care Facility' },
              ]}
            />
            <Select
              value={profile.applicationType}
              onChange={(event) =>
                updateField(setProfile, 'applicationType', event.target.value as CdphE276ProgramProfile['applicationType'])
              }
              options={[
                { label: 'Online NATP', value: 'Online NATP' },
                { label: 'Online Alternative NATP Type I', value: 'Online Alternative NATP Type I' },
                { label: 'Online Alternative NATP Type II', value: 'Online Alternative NATP Type II' },
              ]}
            />
            <Select
              value={profile.programType}
              onChange={(event) => updateField(setProfile, 'programType', event.target.value as CdphE276ProgramProfile['programType'])}
              options={[
                { label: 'Synchronous', value: 'Synchronous' },
                { label: 'Asynchronous', value: 'Asynchronous' },
              ]}
            />
            <Input
              value={profile.programLength}
              onChange={(event) => updateField(setProfile, 'programLength', event.target.value)}
              placeholder="Program length"
              className="h-11 rounded-[14px]"
            />
            <Input
              value={profile.providerLandingPageUrl}
              onChange={(event) => updateField(setProfile, 'providerLandingPageUrl', event.target.value)}
              placeholder="Provider landing page URL"
              className="h-11 rounded-[14px]"
            />
            <Input
              value={profile.learningManagementSystemUrl}
              onChange={(event) => updateField(setProfile, 'learningManagementSystemUrl', event.target.value)}
              placeholder="Learning management system URL"
              className="h-11 rounded-[14px]"
            />
            <Input
              value={profile.curriculumNameEditionYear}
              onChange={(event) => updateField(setProfile, 'curriculumNameEditionYear', event.target.value)}
              placeholder="Curriculum name/edition/year"
              className="h-11 rounded-[14px]"
            />
            <Input
              value={profile.studentFees}
              onChange={(event) => updateField(setProfile, 'studentFees', event.target.value)}
              placeholder="Student fees"
              className="h-11 rounded-[14px]"
            />
          </div>
        </section>

        <section className="rounded-[20px] border border-border-subtle bg-surface p-6">
          <h3 className="font-display text-[18px] font-semibold text-on-surface mb-4">
            Curriculum — Theory &amp; Clinical Hours by Module
          </h3>
          <p className="mb-4 text-sm text-on-surface-variant">
            Pulled read-only from the learning resources configuration — edit module hours there.
          </p>
          <div className="overflow-x-auto rounded-[14px] border border-border-subtle">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="p-3 text-left font-semibold text-on-surface-variant">Module</th>
                  <th className="p-3 text-right font-semibold text-on-surface-variant">Theory Hours</th>
                  <th className="p-3 text-right font-semibold text-on-surface-variant">Clinical Hours</th>
                </tr>
              </thead>
              <tbody>
                {moduleHours.map((module) => (
                  <tr key={module.id} className="border-t border-border-subtle">
                    <td className="p-3 text-on-surface">{module.title}</td>
                    <td className="p-3 text-right font-mono text-on-surface">{module.theoryHours}</td>
                    <td className="p-3 text-right font-mono text-on-surface">{module.clinicalHours}</td>
                  </tr>
                ))}
                <tr className="border-t border-border-subtle bg-surface-muted font-semibold">
                  <td className="p-3 text-on-surface">Total Hours</td>
                  <td className="p-3 text-right font-mono text-on-surface">{totalTheoryHours}</td>
                  <td className="p-3 text-right font-mono text-on-surface">{totalClinicalHours}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex gap-3">
          <Button onClick={() => void saveProfile()} disabled={saving} className="rounded-[14px] gap-2">
            <IconDeviceFloppy className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save Program Profile'}
          </Button>
          <Button
            onClick={() => void downloadPdf()}
            disabled={downloading}
            variant="secondary"
            className="rounded-[14px] gap-2"
          >
            <IconDownload className="h-4 w-4" />
            {downloading ? 'Generating PDF…' : 'Download CDPH E276 PDF'}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}
