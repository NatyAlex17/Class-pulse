import {
  IconCertificate2,
  IconDownload,
  IconFileUpload,
  IconFingerprint,
  IconIdBadge2,
  IconLock,
  IconReportAnalytics,
  IconRosetteDiscountCheck,
  IconSchool,
  IconShieldCheck,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentShell } from '@/components/student/student-shell';

const programDocuments = [
  { title: 'Program Handbook', meta: 'Updated Sep 2023 / 2.4 MB' },
  { title: 'Code of Conduct', meta: 'Updated Aug 2023 / 1.1 MB' },
  { title: 'Clinical Placement Agreement', meta: 'Updated Jan 2024 / 4.8 MB' },
];

const uploads = [
  {
    title: 'Photo ID',
    subtitle: "State Issued Driver's License",
    date: 'MAR 12, 2024',
    icon: IconIdBadge2,
  },
  {
    title: 'High School Diploma',
    subtitle: 'Education Eligibility Proof',
    date: 'FEB 28, 2024',
    icon: IconSchool,
  },
  {
    title: 'Social Security Card',
    subtitle: 'Tax Identification Record',
    date: 'FEB 25, 2024',
    icon: IconFingerprint,
  },
];

export default function StudentDocumentsPage() {
  return (
    <StudentShell
      title="Documents Center"
      patternedCanvas
      topActions={<Button className="hidden rounded-[12px] md:inline-flex">Check Status</Button>}
      stickyFooter={
        <div className="sticky bottom-16 z-30 border-t border-border-subtle bg-surface/80 px-4 py-4 backdrop-blur-md lg:bottom-0 lg:px-8">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-3 text-sm text-on-surface-variant md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <IconShieldCheck className="size-5 text-info" />
              <p>All student records are encrypted and stored according to FERPA compliance standards.</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[11px]">Last compliance check: Today 09:41 AM</span>
              <button className="font-semibold text-primary hover:underline">Request Data Portability</button>
            </div>
          </div>
        </div>
      }
    >
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-display text-[22px] font-semibold text-on-surface">Completion Credentials</h3>
            <p className="text-sm text-on-surface-variant">
              Official certificates and reports generated upon program graduation.
            </p>
          </div>
          <IconRosetteDiscountCheck className="size-8 text-outline opacity-30" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            {
              title: 'Certificate of Completion',
              text: 'Official credential recognized for state certification requirements.',
              icon: IconCertificate2,
              width: '75%',
            },
            {
              title: 'Exam Score Report',
              text: 'Detailed breakdown of final comprehensive examination performance.',
              icon: IconReportAnalytics,
              width: '25%',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="group relative">
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[18px] border border-dashed border-outline-variant bg-surface-dim/40 backdrop-blur-[2px]">
                  <div className="text-center">
                    <IconLock className="mx-auto mb-2 size-5 text-outline" />
                    <p className="text-sm font-medium text-on-surface-variant">
                      Available when program is complete
                    </p>
                  </div>
                </div>
                <div className="rounded-[18px] border border-border-subtle bg-white p-6 opacity-50 grayscale">
                  <div className="mb-8 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-surface-high">
                      <Icon className="size-7 text-outline" />
                    </div>
                    <span className="rounded bg-surface-high px-2 py-1 font-mono text-[10px] uppercase text-on-surface-variant">
                      LOCKED
                    </span>
                  </div>
                  <h4 className="font-display text-[18px] font-semibold text-on-surface">{item.title}</h4>
                  <p className="mb-4 mt-2 text-sm text-on-surface-variant">{item.text}</p>
                  <div className="h-1 overflow-hidden rounded-full bg-surface-high">
                    <div className="h-full rounded-full bg-outline" style={{ width: item.width }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-6">
          <h3 className="font-display text-[22px] font-semibold text-on-surface">Program Documents</h3>
          <p className="text-sm text-on-surface-variant">
            Essential policies and agreements for your current enrollment.
          </p>
        </div>
        <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-white">
          <div className="divide-y divide-border-subtle">
            {programDocuments.map((document) => (
              <div key={document.title} className="flex items-center justify-between p-4 transition hover:bg-surface-muted">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-error-container/20">
                    <IconReportAnalytics className="size-5 text-error" />
                  </div>
                  <div>
                    <h5 className="text-base font-semibold text-on-surface">{document.title}</h5>
                    <p className="text-[12px] text-on-surface-variant">{document.meta}</p>
                  </div>
                </div>
                <button className="rounded-full p-2 text-primary transition hover:bg-surface-high">
                  <IconDownload className="size-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-display text-[22px] font-semibold text-on-surface">Your Uploads</h3>
            <p className="text-sm text-on-surface-variant">
              Identification and educational verification documents you have submitted.
            </p>
          </div>
          <Button variant="secondary" className="rounded-[12px] bg-surface-highest text-primary">
            <IconFileUpload className="size-4" />
            Upload New
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {uploads.map((upload) => {
            const Icon = upload.icon;
            return (
              <div key={upload.title} className="group rounded-[18px] border border-border-subtle bg-white p-5 transition hover:shadow-sm">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 transition group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-5" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="success">Verified</Badge>
                    <span className="font-mono text-[10px] text-on-surface-variant">{upload.date}</span>
                  </div>
                </div>
                <h5 className="font-display text-[16px] font-semibold text-on-surface">{upload.title}</h5>
                <p className="mb-4 mt-1 text-[12px] text-on-surface-variant">{upload.subtitle}</p>
                <div className="flex items-center gap-2 text-[12px] font-semibold text-primary">
                  <button className="hover:underline">View Document</button>
                  <span className="text-outline-variant">/</span>
                  <button className="hover:underline">Replace</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </StudentShell>
  );
}
