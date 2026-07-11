'use client';

import * as React from 'react';
import {
  IconAlertCircle,
  IconCheck,
  IconDownload,
  IconFileCertificate,
  IconSignature,
} from '@tabler/icons-react';
import { useStudentDemo } from '@/components/student/student-portal-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type PaperFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
};

function PaperPage({
  children,
  pageNumber,
}: {
  children: React.ReactNode;
  pageNumber: number;
}) {
  return (
    <section className="mx-auto w-full max-w-[860px] rounded-[28px] border border-stone-300 bg-[#fbfaf5] p-5 shadow-[0_18px_50px_rgba(28,25,23,0.12)]">
      <div className="mb-4 flex items-start justify-between text-[11px] text-stone-600">
        <span>State of California - Health and Human Services Agency</span>
        <span>Page {pageNumber} of 3</span>
      </div>
      {children}
      <div className="mt-6 flex items-center justify-between border-t border-stone-300 pt-3 text-[10px] text-stone-500">
        <span>CDPH 283 B (01/22)</span>
        <span>This form is available on our website at www.cdph.ca.gov</span>
      </div>
    </section>
  );
}

function SectionBar({ title }: { title: string }) {
  return (
    <div className="border border-stone-500 bg-stone-300 px-2 py-1 text-[11px] font-bold tracking-[0.08em] text-stone-900">
      {title}
    </div>
  );
}

function PaperField({ label, value, onChange, className, placeholder, readOnly = false }: PaperFieldProps) {
  return (
    <label className={`block border border-stone-500 px-2 pb-2 pt-1 ${className ?? ''}`}>
      <span className="block text-[10px] leading-tight text-stone-700">{label}</span>
      <input
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        suppressHydrationWarning
        className="mt-2 h-7 w-full border-0 bg-transparent p-0 text-[13px] text-stone-950 outline-none placeholder:text-stone-400"
      />
    </label>
  );
}

function PaperTextarea({
  label,
  value,
  onChange,
  className,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  rows?: number;
}) {
  return (
    <label className={`block border border-stone-500 px-2 pb-2 pt-1 ${className ?? ''}`}>
      <span className="block text-[10px] leading-tight text-stone-700">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        suppressHydrationWarning
        className="mt-2 w-full resize-none border-0 bg-transparent p-0 text-[13px] text-stone-950 outline-none"
      />
    </label>
  );
}

function PaperRadio({
  name,
  label,
  checked,
  onSelect,
}: {
  name: string;
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-left text-[12px] text-stone-900">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
        className="h-4 w-4 cursor-pointer accent-stone-900"
      />
      <span>{label}</span>
    </label>
  );
}

export function StudentCdphPaperForm() {
  const {
    cdphForm,
    cdphSigned,
    updateCdphField,
    signCdphForm,
    downloadCdph283bPdf,
  } = useStudentDemo();

  const [cdphValidationErrors, setCdphValidationErrors] = React.useState<string[]>([]);
  const [isDownloadingCdphPdf, setIsDownloadingCdphPdf] = React.useState(false);
  const [cdphDownloadError, setCdphDownloadError] = React.useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = React.useState(false);

  React.useEffect(() => {
    setHasHydrated(true);
  }, []);

  const handleDownloadCdphPdf = async () => {
    setIsDownloadingCdphPdf(true);
    setCdphDownloadError(null);
    try {
      await downloadCdph283bPdf();
    } catch (error) {
      setCdphDownloadError(error instanceof Error ? error.message : 'Failed to download the PDF.');
    } finally {
      setIsDownloadingCdphPdf(false);
    }
  };

  const validateCdphForm = React.useCallback(() => {
    const errors: string[] = [];
    if (!cdphForm.firstName.trim()) errors.push('First name is required.');
    if (!cdphForm.lastName.trim()) errors.push('Last name is required.');
    if (!cdphForm.dob.trim()) errors.push('Date of birth is required.');
    if (!cdphForm.addressLine1.trim()) errors.push('Public address is required.');
    if (!cdphForm.phone.trim()) errors.push('Phone number is required.');
    if (!cdphForm.email.trim()) errors.push('Email is required.');
    if (!cdphForm.city.trim()) errors.push('City is required.');
    if (!cdphForm.state.trim()) errors.push('State is required.');
    if (!cdphForm.zip.trim()) errors.push('ZIP code is required.');
    if (!cdphForm.ssn.trim() && !cdphForm.itin.trim()) {
      errors.push('Enter either SSN or ITIN.');
    }
    if (cdphForm.conviction && !cdphForm.convictionDescription.trim()) {
      errors.push('Conviction details are required when you answer Yes.');
    }
    if (
      cdphForm.adverseAction &&
      (!cdphForm.adverseActionLicenseType.trim() || !cdphForm.adverseActionType.trim())
    ) {
      errors.push('License type and action details are required when adverse action is marked Yes.');
    }
    return errors;
  }, [cdphForm]);

  const handleCdphSubmit = () => {
    const errors = validateCdphForm();
    if (errors.length > 0) {
      setCdphValidationErrors(errors);
      return;
    }
    setCdphValidationErrors([]);
    signCdphForm();
  };

  return (
    <div className="space-y-2">
      <section className="rounded-[20px] border border-border-subtle bg-surface p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
              <IconFileCertificate className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-[18px] font-semibold text-on-surface">CDPH 283B Application</h3>
              <p className="text-sm text-on-surface-variant">Official paper-style application workspace</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={cdphSigned ? 'success' : 'warning'}>
              {cdphSigned ? 'Submitted' : 'In Progress'}
            </Badge>
            <Button onClick={handleCdphSubmit} suppressHydrationWarning className="rounded-[14px] gap-2">
              <IconSignature className="size-4" />
              {cdphSigned ? 'Signed Application' : 'Submit & Sign'}
            </Button>
            <Button
              onClick={handleDownloadCdphPdf}
              disabled={!cdphSigned || isDownloadingCdphPdf}
              variant="secondary"
              suppressHydrationWarning
              className="rounded-[14px] gap-2"
            >
              <IconDownload className="size-4" />
              {isDownloadingCdphPdf ? 'Generating PDF...' : 'Download Matching PDF'}
            </Button>
          </div>
        </div>

        {cdphDownloadError ? <p className="mt-3 text-sm text-error">{cdphDownloadError}</p> : null}
        {cdphSigned ? (
          <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-success/30 bg-success/10 p-3 text-sm text-on-surface">
            <IconCheck className="mt-0.5 size-4 shrink-0 text-success" />
            <span>Signed and ready for official PDF export.</span>
          </div>
        ) : null}

        {cdphValidationErrors.length > 0 ? (
          <div className="mt-3 rounded-[14px] border border-error/30 bg-error/10 p-4 text-sm text-error">
            <div className="mb-2 flex items-start gap-2 font-semibold">
              <IconAlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>Fix these items before signing:</span>
            </div>
            <ul className="space-y-1 pl-6">
              {cdphValidationErrors.map((error) => (
                <li key={error} className="list-disc">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <PaperPage pageNumber={1}>
        <div className="mb-5 text-center">
          <h2 className="text-[22px] font-bold tracking-[0.08em] text-stone-900">CERTIFIED NURSE ASSISTANT (CNA)</h2>
          <p className="mt-1 text-[18px] font-bold tracking-[0.12em] text-stone-900">INITIAL APPLICATION</p>
          <p className="mt-1 text-[11px] italic text-stone-600">(See instructions on the reverse)</p>
        </div>

        <SectionBar title="SECTION I (REQUIRED)" />
        <div className="border-x border-b border-stone-500 p-3 text-[12px] text-stone-900">
          <p className="mb-3 font-bold">TYPE OF REQUEST</p>
          <div className="space-y-2">
            <PaperRadio
              name="requestType"
              label="Check here if you are enrolling in a CNA training program"
              checked={cdphForm.requestType === 'enrollment'}
              onSelect={() => updateCdphField('requestType', 'enrollment')}
            />
            <PaperRadio
              name="requestType"
              label="Check here if you are requesting reconsideration for a previously revoked or denied certificate"
              checked={cdphForm.requestType === 'reconsideration'}
              onSelect={() => updateCdphField('requestType', 'reconsideration')}
            />
          </div>
        </div>

        <div className="mt-0">
          <SectionBar title="SECTION II (REQUIRED)" />
          <div className="grid grid-cols-12 border-x border-b border-stone-500">
            <PaperField label="Last Name" value={cdphForm.lastName} onChange={(value) => updateCdphField('lastName', value)} className="col-span-5 border-r-0" />
            <PaperField label="First Name" value={cdphForm.firstName} onChange={(value) => updateCdphField('firstName', value)} className="col-span-3 border-r-0" />
            <PaperField label="MI" value={cdphForm.middleInitial} onChange={(value) => updateCdphField('middleInitial', value)} className="col-span-1 border-r-0" />
            <div className="col-span-3 border border-stone-500 px-2 pb-2 pt-1">
              <span className="block text-[10px] text-stone-700">Sex</span>
              <div className="mt-3 flex gap-4">
                <PaperRadio name="sex" label="Male" checked={cdphForm.sex === 'Male'} onSelect={() => updateCdphField('sex', 'Male')} />
                <PaperRadio name="sex" label="Female" checked={cdphForm.sex === 'Female'} onSelect={() => updateCdphField('sex', 'Female')} />
              </div>
            </div>

            <PaperField
              label="Public Address (Required) - Subject to Public Records Act request release"
              value={cdphForm.addressLine1}
              onChange={(value) => updateCdphField('addressLine1', value)}
              className="col-span-6 border-r-0 border-t-0"
            />
            <PaperField label="City" value={cdphForm.city} onChange={(value) => updateCdphField('city', value)} className="col-span-3 border-r-0 border-t-0" />
            <PaperField label="State" value={cdphForm.state} onChange={(value) => updateCdphField('state', value)} className="col-span-1 border-r-0 border-t-0" />
            <PaperField label="Zip Code" value={cdphForm.zip} onChange={(value) => updateCdphField('zip', value)} className="col-span-2 border-t-0" />

            <PaperField
              label="Confidential Address (For CDPH use only. If left blank, mail goes to the public address above)"
              value={cdphForm.confidentialAddressLine1}
              onChange={(value) => updateCdphField('confidentialAddressLine1', value)}
              className="col-span-6 border-r-0 border-t-0"
            />
            <PaperField
              label="City"
              value={cdphForm.confidentialCity}
              onChange={(value) => updateCdphField('confidentialCity', value)}
              className="col-span-3 border-r-0 border-t-0"
            />
            <PaperField
              label="State"
              value={cdphForm.confidentialState}
              onChange={(value) => updateCdphField('confidentialState', value)}
              className="col-span-1 border-r-0 border-t-0"
            />
            <PaperField
              label="Zip Code"
              value={cdphForm.confidentialZip}
              onChange={(value) => updateCdphField('confidentialZip', value)}
              className="col-span-2 border-t-0"
            />

            <PaperField label="Date of Birth (mm/dd/yy)" value={cdphForm.dob} onChange={(value) => updateCdphField('dob', value)} className="col-span-2 border-r-0 border-t-0" placeholder="MM/DD/YYYY" />
            <PaperField
              label="Social Security Number (SSN)"
              value={cdphForm.ssn}
              onChange={(value) => updateCdphField('ssn', value)}
              className="col-span-4 border-r-0 border-t-0"
            />
            <PaperField
              label="Individual Taxpayer Identification Number (ITIN)"
              value={cdphForm.itin}
              onChange={(value) => updateCdphField('itin', value)}
              className="col-span-3 border-r-0 border-t-0"
            />
            <PaperField
              label="Driver's License / State ID Number"
              value={cdphForm.driversLicenseNumber}
              onChange={(value) => updateCdphField('driversLicenseNumber', value)}
              className="col-span-3 border-t-0"
            />

            <PaperField
              label="Driver's License / State ID State"
              value={cdphForm.driversLicenseState}
              onChange={(value) => updateCdphField('driversLicenseState', value)}
              className="col-span-3 border-r-0 border-t-0"
            />
            <PaperField label="Telephone Number" value={cdphForm.phone} onChange={(value) => updateCdphField('phone', value)} className="col-span-4 border-r-0 border-t-0" />
            <PaperField label="Email Address" value={cdphForm.email} onChange={(value) => updateCdphField('email', value)} className="col-span-5 border-t-0" />
          </div>
        </div>
      </PaperPage>

      <PaperPage pageNumber={2}>
        <SectionBar title="SECTION III (REQUIRED)" />
        <div className="border-x border-b border-stone-500 p-3 text-[12px] text-stone-900">
          <p className="font-semibold">1. Have you ever been convicted of a crime in any state, federal court, military tribunal, or foreign country?</p>
          <div className="mt-3 flex flex-wrap gap-5">
            <PaperRadio name="conviction" label="Yes" checked={cdphForm.conviction} onSelect={() => updateCdphField('conviction', true)} />
            <PaperRadio name="conviction" label="No" checked={!cdphForm.conviction} onSelect={() => updateCdphField('conviction', false)} />
          </div>
          <div className="mt-3 grid gap-0 md:grid-cols-12">
            <PaperField
              label="If yes, list conviction"
              value={cdphForm.convictionDescription}
              onChange={(value) => updateCdphField('convictionDescription', value)}
              className="md:col-span-6 md:border-r-0"
            />
            <PaperField
              label="Court of conviction"
              value={cdphForm.convictionCourt}
              onChange={(value) => updateCdphField('convictionCourt', value)}
              className="md:col-span-4 md:border-r-0 max-md:border-t-0"
            />
            <PaperField
              label="Date"
              value={cdphForm.convictionDate}
              onChange={(value) => updateCdphField('convictionDate', value)}
              className="md:col-span-2 max-md:border-t-0"
            />
          </div>

          <p className="mt-5 font-semibold">2. Have you ever had an occupational or professional license revoked, suspended, placed on probation, or disciplined?</p>
          <div className="mt-3 flex flex-wrap gap-5">
            <PaperRadio name="adverseAction" label="Yes" checked={cdphForm.adverseAction} onSelect={() => updateCdphField('adverseAction', true)} />
            <PaperRadio name="adverseAction" label="No" checked={!cdphForm.adverseAction} onSelect={() => updateCdphField('adverseAction', false)} />
          </div>
          <div className="mt-3 grid gap-0 md:grid-cols-12">
            <PaperField
              label="License / Certificate Type"
              value={cdphForm.adverseActionLicenseType}
              onChange={(value) => updateCdphField('adverseActionLicenseType', value)}
              className="md:col-span-4 md:border-r-0"
            />
            <PaperField
              label="License / Certificate Number"
              value={cdphForm.adverseActionLicenseNumber}
              onChange={(value) => updateCdphField('adverseActionLicenseNumber', value)}
              className="md:col-span-4 md:border-r-0 max-md:border-t-0"
            />
            <PaperField
              label="Action Taken"
              value={cdphForm.adverseActionType}
              onChange={(value) => updateCdphField('adverseActionType', value)}
              className="md:col-span-4 max-md:border-t-0"
            />
          </div>
        </div>

        <div className="mt-0">
          <SectionBar title="SECTION IV (REQUIRED FOR CNA TRAINING PROGRAM APPLICANTS)" />
          <div className="grid grid-cols-12 border-x border-b border-stone-500">
            <PaperField
              label="Training Program Name"
              value={cdphForm.trainingProgramName}
              onChange={(value) => updateCdphField('trainingProgramName', value)}
              className="col-span-7 border-r-0"
            />
            <PaperField
              label="Training Program Phone"
              value={cdphForm.trainingProgramPhone}
              onChange={(value) => updateCdphField('trainingProgramPhone', value)}
              className="col-span-5"
            />
            <PaperField
              label="Training Program Address"
              value={cdphForm.trainingProgramAddressLine1}
              onChange={(value) => updateCdphField('trainingProgramAddressLine1', value)}
              className="col-span-6 border-r-0 border-t-0"
            />
            <PaperField
              label="City"
              value={cdphForm.trainingProgramCity}
              onChange={(value) => updateCdphField('trainingProgramCity', value)}
              className="col-span-3 border-r-0 border-t-0"
            />
            <PaperField
              label="State"
              value={cdphForm.trainingProgramState}
              onChange={(value) => updateCdphField('trainingProgramState', value)}
              className="col-span-1 border-r-0 border-t-0"
            />
            <PaperField
              label="Zip"
              value={cdphForm.trainingProgramZip}
              onChange={(value) => updateCdphField('trainingProgramZip', value)}
              className="col-span-2 border-t-0"
            />
            <PaperField
              label="Training Program ID"
              value={cdphForm.trainingProgramId}
              onChange={(value) => updateCdphField('trainingProgramId', value)}
              className="col-span-4 border-r-0 border-t-0"
            />
            <PaperField
              label="Training Begin Date"
              value={cdphForm.trainingBeginDate}
              onChange={(value) => updateCdphField('trainingBeginDate', value)}
              className="col-span-4 border-r-0 border-t-0"
            />
            <PaperField
              label="Training End Date"
              value={cdphForm.trainingEndDate}
              onChange={(value) => updateCdphField('trainingEndDate', value)}
              className="col-span-4 border-t-0"
            />
          </div>
        </div>
      </PaperPage>

      <PaperPage pageNumber={3}>
        <SectionBar title="SECTION V (REQUIRED)" />
        <div className="border-x border-b border-stone-500 p-4 text-[12px] leading-5 text-stone-900">
          <p className="font-semibold">
            I certify under penalty of perjury that the statements made in this application are true and complete.
          </p>
          <div className="mt-4 grid gap-0 md:grid-cols-12">
            <PaperField
              label="Applicant Printed Name"
              value={`${cdphForm.firstName} ${cdphForm.middleInitial} ${cdphForm.lastName}`.replace(/\s+/g, ' ').trim()}
              onChange={() => undefined}
              readOnly
              className="md:col-span-7 md:border-r-0"
            />
            <PaperField
              label="Date Signed"
              value={hasHydrated && cdphSigned ? new Date().toLocaleDateString() : ''}
              onChange={() => undefined}
              readOnly
              className="md:col-span-5 max-md:border-t-0"
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-[16px] border border-stone-300 bg-stone-100 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-600">Review Notes</p>
              <p className="mt-2 text-sm text-stone-700">
                This screen is intentionally styled like the official CDPH paper packet so students fill it with the same visual rhythm as the real form.
              </p>
            </div>
            <PaperTextarea
              label="Optional Notes Before Signing"
              value=""
              onChange={() => undefined}
              rows={4}
            />
          </div>
        </div>
      </PaperPage>
    </div>
  );
}
