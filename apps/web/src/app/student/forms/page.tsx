'use client';

import * as React from 'react';
import {
  IconCheck,
  IconFileCertificate,
  IconFingerprint,
  IconSignature,
  IconX,
  IconDownload,
  IconEye,
  IconClipboardCheck,
  IconAlertCircle,
  IconClock,
} from '@tabler/icons-react';
import { useStudentDemo } from '@/components/student/student-portal-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StudentShell } from '@/components/student/student-shell';
import { Textarea } from '@/components/ui/textarea';

export default function StudentFormsPage() {
  const {
    liveScanGenerated,
    liveScanUploaded,
    cdphForm,
    cdphSigned,
    generateLiveScan,
    toggleLiveScanUpload,
    updateCdphField,
    signCdphForm,
    downloadCdph283bPdf,
  } = useStudentDemo();

  const [showLiveScanModal, setShowLiveScanModal] = React.useState(false);
  const [showCdphModal, setShowCdphModal] = React.useState(false);
  const [showCdphPreview, setShowCdphPreview] = React.useState(false);
  const [liveScanStage, setLiveScanStage] = React.useState<'intro' | 'generated' | 'uploaded'>('intro');
  const [cdphValidationErrors, setCdphValidationErrors] = React.useState<string[]>([]);
  const [isDownloadingCdphPdf, setIsDownloadingCdphPdf] = React.useState(false);
  const [cdphDownloadError, setCdphDownloadError] = React.useState<string | null>(null);

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

  const validateCdphForm = () => {
    const errors: string[] = [];
    if (!cdphForm.firstName) errors.push('First name is required');
    if (!cdphForm.lastName) errors.push('Last name is required');
    if (!cdphForm.dob) errors.push('Date of birth is required');
    if (!cdphForm.ssn) errors.push('Social Security Number is required');
    if (!cdphForm.addressLine1) errors.push('Street address is required');
    if (!cdphForm.phone) errors.push('Phone number is required');
    if (!cdphForm.email) errors.push('Email is required');
    if (!cdphForm.city) errors.push('City is required');
    if (!cdphForm.state) errors.push('State is required');
    if (!cdphForm.zip) errors.push('ZIP code is required');
    return errors;
  };

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
    <>
      <StudentShell
        title="Forms & Applications"
        subtitle="Manage required documents, applications, and compliance forms."
      >
        {/* Forms Overview */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[16px] border border-border-subtle bg-surface p-4">
            <p className="text-[12px] font-semibold text-on-surface-variant uppercase">Forms Required</p>
            <p className="mt-2 font-mono text-2xl font-bold text-on-surface">2</p>
            <p className="mt-1 text-[11px] text-on-surface-variant">Live Scan & CDPH Application</p>
          </div>
          <div className="rounded-[16px] border border-border-subtle bg-surface p-4">
            <p className="text-[12px] font-semibold text-on-surface-variant uppercase">Completed</p>
            <p className="mt-2 font-mono text-2xl font-bold text-success">{liveScanGenerated && cdphSigned ? '2' : liveScanGenerated || cdphSigned ? '1' : '0'}</p>
            <p className="mt-1 text-[11px] text-on-surface-variant">Of 2 forms</p>
          </div>
          <div className="rounded-[16px] border border-border-subtle bg-surface p-4">
            <p className="text-[12px] font-semibold text-on-surface-variant uppercase">Status</p>
            <p className="mt-2 text-sm font-bold text-primary">{liveScanGenerated && cdphSigned ? '✓ Complete' : 'In Progress'}</p>
            <p className="mt-1 text-[11px] text-on-surface-variant">All required forms</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
        {/* Live Scan Form */}
        <section className="rounded-[20px] border border-border-subtle bg-surface p-6">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                <IconFingerprint className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-[20px] font-semibold text-on-surface">Live Scan Request</h3>
                <p className="text-sm text-on-surface-variant">Background clearance form (BCIA 8016)</p>
              </div>
            </div>
            <Badge variant={liveScanGenerated && liveScanUploaded ? 'success' : liveScanGenerated ? 'info' : 'neutral'}>
              {liveScanGenerated && liveScanUploaded ? 'Submitted' : liveScanGenerated ? 'Generated' : 'Pending'}
            </Badge>
          </div>

          <div className="mb-6 rounded-[16px] border border-border-subtle bg-surface-muted p-4">
            <p className="text-sm text-on-surface-variant leading-6">
              Generate your fingerprint request form (BCIA 8016). Once generated, download and print it for your scheduled appointment at an authorized live scan location.
            </p>
          </div>

          {!liveScanGenerated ? (
            <Button onClick={() => {
              generateLiveScan();
              setShowLiveScanModal(true);
              setLiveScanStage('generated');
            }} className="rounded-[14px] w-full">
              Generate Form
            </Button>
          ) : !liveScanUploaded ? (
            <div className="space-y-3">
              <Button onClick={() => setShowLiveScanModal(true)} variant="secondary" className="rounded-[14px] w-full gap-2">
                <IconEye className="h-4 w-4" />
                View Generated Form
              </Button>
              <Button onClick={() => {
                toggleLiveScanUpload();
                setLiveScanStage('uploaded');
              }} className="rounded-[14px] w-full">
                Mark as Uploaded
              </Button>
            </div>
          ) : (
            <div className="rounded-[14px] border border-success/30 bg-success/10 p-4">
              <div className="flex items-center gap-3">
                <IconCheck className="h-5 w-5 text-success" />
                <div>
                  <p className="font-semibold text-on-surface">Form Submitted</p>
                  <p className="text-sm text-on-surface-variant">Your signed Live Scan form has been received</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[14px] border border-border-subtle bg-surface p-4">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase">Form Type</p>
              <p className="mt-2 text-sm font-semibold text-on-surface">BCIA 8016</p>
            </div>
            <div className="rounded-[14px] border border-border-subtle bg-surface p-4">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase">Status</p>
              <p className="mt-2 text-sm font-semibold text-on-surface">{liveScanGenerated && liveScanUploaded ? '✓ Submitted' : liveScanGenerated ? 'Generated' : 'Pending'}</p>
            </div>
          </div>
        </section>

        {/* CDPH Form */}
        <section className="rounded-[20px] border border-border-subtle bg-surface p-6">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                <IconFileCertificate className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-[20px] font-semibold text-on-surface">CDPH 283B Application</h3>
                <p className="text-sm text-on-surface-variant">Department of Public Health application</p>
              </div>
            </div>
            <Badge variant={cdphSigned ? 'success' : 'warning'}>
              {cdphSigned ? 'Submitted' : 'In Progress'}
            </Badge>
          </div>

          {cdphValidationErrors.length > 0 && (
            <div className="mb-6 rounded-[14px] border border-error/30 bg-error/10 p-4">
              <div className="flex gap-3">
                <IconAlertCircle className="h-5 w-5 shrink-0 text-error mt-0.5" />
                <div className="text-sm text-error">
                  <p className="font-semibold mb-2">Please fix these errors:</p>
                  <ul className="space-y-1">
                    {cdphValidationErrors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {!cdphSigned ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  value={cdphForm.firstName}
                  onChange={(event) => updateCdphField('firstName', event.target.value)}
                  placeholder="First name"
                  className="h-11 rounded-[14px]"
                />
                <Input
                  value={cdphForm.lastName}
                  onChange={(event) => updateCdphField('lastName', event.target.value)}
                  placeholder="Last name"
                  className="h-11 rounded-[14px]"
                />
                <Input
                  value={cdphForm.dob}
                  onChange={(event) => updateCdphField('dob', event.target.value)}
                  placeholder="Date of birth (MM/DD/YYYY)"
                  className="h-11 rounded-[14px]"
                />
                <Input
                  value={cdphForm.phone}
                  onChange={(event) => updateCdphField('phone', event.target.value)}
                  placeholder="Phone number"
                  className="h-11 rounded-[14px]"
                />
                <Input
                  value={cdphForm.email}
                  onChange={(event) => updateCdphField('email', event.target.value)}
                  placeholder="Email address"
                  className="h-11 rounded-[14px]"
                />
                <Input
                  value={cdphForm.ssn}
                  onChange={(event) => updateCdphField('ssn', event.target.value)}
                  placeholder="Social Security Number"
                  className="h-11 rounded-[14px]"
                />
                <Input
                  value={cdphForm.addressLine1}
                  onChange={(event) => updateCdphField('addressLine1', event.target.value)}
                  placeholder="Street address"
                  className="h-11 rounded-[14px]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  value={cdphForm.city}
                  onChange={(event) => updateCdphField('city', event.target.value)}
                  placeholder="City"
                  className="h-11 rounded-[14px]"
                />
                <Input
                  value={cdphForm.state}
                  onChange={(event) => updateCdphField('state', event.target.value)}
                  placeholder="State"
                  className="h-11 rounded-[14px]"
                />
                <Input
                  value={cdphForm.zip}
                  onChange={(event) => updateCdphField('zip', event.target.value)}
                  placeholder="ZIP code"
                  className="h-11 rounded-[14px]"
                />
                <Select
                  value={cdphForm.conviction ? 'yes' : 'no'}
                  onChange={(event) => updateCdphField('conviction', event.target.value === 'yes')}
                  options={[
                    { label: 'No prior convictions', value: 'no' },
                    { label: 'Conviction disclosure required', value: 'yes' },
                  ]}
                />
              </div>

              {cdphForm.conviction && (
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Conviction Details</label>
                  <Textarea
                    value={cdphForm.convictionDetails}
                    onChange={(event) => updateCdphField('convictionDetails', event.target.value)}
                    placeholder="Provide details of conviction..."
                    className="rounded-[14px]"
                  />
                </div>
              )}

              <div className="rounded-[14px] border border-primary/20 bg-primary/5 p-4">
                <div className="flex gap-3">
                  <IconSignature className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-on-surface">Review & Submit</p>
                    <p className="text-sm text-on-surface-variant mt-1">By submitting, you confirm all information is accurate and complete.</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setShowCdphPreview(true);
                  }}
                  variant="secondary"
                  className="mt-4 rounded-[14px] w-full"
                >
                  Review Form
                </Button>
              </div>

              <Button
                onClick={handleCdphSubmit}
                disabled={cdphValidationErrors.length > 0}
                className="rounded-[14px] w-full"
              >
                Submit & Sign Application
              </Button>
            </div>
          ) : (
            <div className="rounded-[14px] border border-success/30 bg-success/10 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20">
                  <IconCheck className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-on-surface text-lg">Application Submitted</p>
                  <p className="text-sm text-on-surface-variant mt-1">Your CDPH 283B application has been successfully signed and submitted.</p>
                </div>
              </div>
              <div className="bg-surface rounded-[12px] p-3 text-[12px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Submitted Date</span>
                  <span className="font-mono font-semibold text-on-surface">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Status</span>
                  <span className="font-semibold text-success">Pending Review</span>
                </div>
              </div>

              {cdphDownloadError && (
                <p className="mt-4 text-sm text-error">{cdphDownloadError}</p>
              )}

              <Button
                onClick={handleDownloadCdphPdf}
                disabled={isDownloadingCdphPdf}
                variant="secondary"
                className="mt-4 rounded-[14px] w-full gap-2"
              >
                <IconDownload className="h-4 w-4" />
                {isDownloadingCdphPdf ? 'Generating PDF…' : 'Download CDPH 283B PDF'}
              </Button>
            </div>
          )}
        </section>
      </div>
      </StudentShell>

      {/* Live Scan Modal */}
      {showLiveScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[24px] bg-surface p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-on-surface">BCIA 8016 Form</h2>
              <button
                onClick={() => setShowLiveScanModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <IconX className="h-6 w-6" />
              </button>
            </div>

            {liveScanGenerated && (
              <div className="space-y-4 mb-6">
                <div className="rounded-[14px] border border-border-subtle bg-surface-muted p-6 text-center">
                  <IconFileCertificate className="h-16 w-16 mx-auto text-primary mb-4" />
                  <p className="font-mono text-[12px] text-on-surface-variant uppercase mb-2">Form</p>
                  <p className="font-bold text-on-surface text-lg mb-2">BCIA 8016</p>
                  <p className="text-[12px] text-on-surface-variant mb-4">Background Clearance Form</p>
                  <Button
                    variant="secondary"
                    className="w-full rounded-[12px] gap-2"
                    onClick={() => {
                      const doc = `
CALIFORNIA DEPARTMENT OF JUSTICE
FINGERPRINT CLEARANCE REQUEST
BCIA 8016

Date: ${new Date().toLocaleDateString()}
Student ID: STU-2024-00447
Name: Sarah Jenkins

INSTRUCTIONS:
1. Print this form
2. Bring original to authorized Live Scan facility
3. Provide to fingerprint technician
4. Technician will scan and submit to BCIA

Authorized Live Scan Locations:
- Local Police Department
- Licensed Fingerprint Service
- Vital Records Office

After submission, results typically arrive within 2-3 weeks.

This form is valid for 6 months from generation date.
                      `;
                      const element = document.createElement('a');
                      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(doc));
                      element.setAttribute('download', 'BCIA_8016.txt');
                      element.style.display = 'none';
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                  >
                    <IconDownload className="h-4 w-4" />
                    Download Form
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-on-surface">Next Steps:</p>
                  <ol className="space-y-2 text-on-surface-variant">
                    <li className="flex gap-2">
                      <span className="font-bold text-primary">1.</span>
                      <span>Download and print this form</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-primary">2.</span>
                      <span>Visit an authorized Live Scan location</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-primary">3.</span>
                      <span>Complete the fingerprinting process</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-primary">4.</span>
                      <span>Return the signed form to us</span>
                    </li>
                  </ol>
                </div>
              </div>
            )}

            <Button
              onClick={() => setShowLiveScanModal(false)}
              className="w-full rounded-[12px]"
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* CDPH Preview Modal */}
      {showCdphPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[24px] bg-surface p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-on-surface">Application Summary</h2>
              <button
                onClick={() => setShowCdphPreview(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <IconX className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="rounded-[14px] border border-border-subtle p-4">
                <p className="text-[11px] font-bold text-on-surface-variant uppercase">Personal Information</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Name</span>
                    <span className="font-semibold text-on-surface">{cdphForm.firstName} {cdphForm.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Date of Birth</span>
                    <span className="font-semibold text-on-surface">{cdphForm.dob}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Email</span>
                    <span className="font-semibold text-on-surface">{cdphForm.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Phone</span>
                    <span className="font-semibold text-on-surface">{cdphForm.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Address</span>
                    <span className="font-semibold text-on-surface">
                      {cdphForm.addressLine1}, {cdphForm.city}, {cdphForm.state} {cdphForm.zip}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[14px] border border-border-subtle p-4">
                <p className="text-[11px] font-bold text-on-surface-variant uppercase">Certification</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Prior Convictions</span>
                    <Badge variant={cdphForm.conviction ? 'warning' : 'success'}>
                      {cdphForm.conviction ? 'Disclosed' : 'None'}
                    </Badge>
                  </div>
                  {cdphForm.conviction && (
                    <div className="mt-2 p-2 bg-warning/10 rounded text-on-surface-variant text-xs">
                      {cdphForm.convictionDetails}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[14px] border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm text-on-surface"><strong>Declaration:</strong> I certify that all information provided is true and accurate.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowCdphPreview(false)}
                className="flex-1 rounded-[12px]"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  handleCdphSubmit();
                  setShowCdphPreview(false);
                }}
                className="flex-1 rounded-[12px]"
              >
                Confirm & Sign
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
