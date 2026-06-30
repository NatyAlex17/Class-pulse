import {
  IconCalendarDue,
  IconCheck,
  IconCreditCard,
  IconDownload,
  IconRobot,
  IconSearch,
  IconTrendingDown,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { StudentShell } from '@/components/student/student-shell';

type PaymentRow = {
  date: string;
  amount: string;
  status: 'Completed';
};

const paymentRows: PaymentRow[] = [
  { date: 'July 15, 2024', amount: '$875.00', status: 'Completed' },
  { date: 'April 15, 2024', amount: '$875.00', status: 'Completed' },
  { date: 'January 15, 2024', amount: '$875.00', status: 'Completed' },
];

const columns: DataTableColumn<PaymentRow>[] = [
  { id: 'date', header: 'Date', accessorKey: 'date' },
  { id: 'amount', header: 'Amount', accessorKey: 'amount' },
  {
    id: 'status',
    header: 'Status',
    cell: () => <Badge variant="success">Completed</Badge>,
  },
  {
    id: 'receipt',
    header: 'Receipt',
    cell: () => (
      <button className="text-outline transition hover:text-primary">
        <IconDownload className="size-5" />
      </button>
    ),
  },
];

export default function StudentFinancialsPage() {
  return (
    <StudentShell
      title="Financial Overview"
      subtitle="Manage your tuition, payment plans, and scholarship disbursement."
      topActions={
        <div className="hidden items-center gap-8 md:flex">
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
            <Input
              placeholder="Search financials..."
              className="h-9 w-64 rounded-full border-0 bg-surface-low pl-10"
            />
          </div>
        </div>
      }
      profileName="Sarah Jenkins"
      profileMeta="BNS Nursing Student"
      profileImageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDf6HnCMkNHZlbyGnX9vhP7RdDxyWbBaIIvXRMM6AM4S-bbpGQRU46l3YXzTF8-_L7cHkf-nq43C-CgNbOiDLrLSZC6b8YLzSnR5dfcYGlqDMXFe8qHChFUDNXqt3nHhsXnXNGLqgH8cFVDQYPvtdtcyPc5C8tWwClRE8ZjiciWKqDyQulGMA89qV1H3sy3Z3EnN_kK8bB_Ac8zPicp7arwLtTO37sFPfHjLvWSHbSK6IDeIf80QN1EY5raYQeXcSdbN9Pwy3pKsLDn"
    >
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div />
        <div className="flex items-center gap-3 rounded-[16px] border border-success/20 bg-success/10 px-4 py-2.5 text-success">
          <IconCheck className="size-5" />
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none">On Track</span>
            <span className="text-[12px] opacity-90">Final payment scheduled for Oct 15, 2024</span>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            label: 'Total Tuition',
            value: '$3,500.00',
            note: 'Annual Program Fee (2023-2024)',
            width: '100%',
            tone: 'bg-primary',
          },
          {
            label: 'Amount Paid',
            value: '$2,625.00',
            note: '75% of total balance cleared',
            width: '75%',
            tone: 'bg-success',
          },
          {
            label: 'Balance Due',
            value: '$875.00',
            note: 'Remaining in 1 installment',
            width: '25%',
            tone: 'bg-primary-container',
          },
        ].map((card) => (
          <div key={card.label} className="rounded-[18px] border border-border-subtle bg-white p-6 transition hover:border-primary/30">
            <div className="mb-4 flex items-start justify-between">
              <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-outline">{card.label}</span>
              <IconCreditCard className="size-6 text-outline/50" />
            </div>
            <div className="font-mono text-[32px] font-bold tracking-tight text-on-surface">{card.value}</div>
            <div className="mt-4 h-1.5 w-full rounded-full bg-surface-container">
              <div className={`h-full rounded-full ${card.tone}`} style={{ width: card.width }} />
            </div>
            <p className="mt-2 text-[11px] text-outline">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 rounded-[18px] border border-border-subtle bg-white p-6 lg:col-span-4">
          <h3 className="mb-6 font-display text-[18px] font-semibold">Installment Plan</h3>
          <div className="relative space-y-0">
            <div className="absolute bottom-10 left-[19px] top-4 w-0.5 bg-border-subtle" />
            {[
              { label: 'Installment 01', status: 'Paid', meta: '$875.00 / Paid Jan 15', done: true },
              { label: 'Installment 02', status: 'Paid', meta: '$875.00 / Paid Apr 15', done: true },
              { label: 'Installment 03', status: 'Paid', meta: '$875.00 / Paid Jul 15', done: true },
              { label: 'Installment 04', status: 'Upcoming', meta: '$875.00 / Due Oct 15', done: false },
            ].map((step, index) => (
              <div key={step.label} className={`relative flex gap-4 ${index < 3 ? 'pb-8' : ''}`}>
                <div
                  className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    step.done
                      ? 'border-success bg-success/10 text-success'
                      : 'border-warning bg-warning/10 text-warning'
                  }`}
                >
                  {step.done ? <IconCheck className="size-4" /> : <IconCalendarDue className="size-4" />}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-on-surface">{step.label}</h4>
                    <Badge variant={step.done ? 'success' : 'warning'}>{step.status}</Badge>
                  </div>
                  <p className="mt-1 font-mono text-[12px] text-outline">{step.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-12 flex flex-col gap-6 lg:col-span-8">
          <div className="flex flex-col items-center justify-between gap-6 rounded-[18px] bg-primary p-6 text-white shadow-xl shadow-primary/20 md:flex-row">
            <div className="flex items-center gap-5">
              <div className="flex h-9 w-14 items-center justify-center rounded-md border border-white/20 bg-white/10">
                <span className="text-[14px] font-bold italic">VISA</span>
              </div>
              <div>
                <h4 className="text-base font-bold">Active Card on File</h4>
                <p className="font-mono text-sm text-white/70">.... .... .... 4242 / Exp 09/27</p>
              </div>
            </div>
            <Button variant="secondary" className="w-full rounded-[16px] bg-white text-primary hover:bg-surface-low md:w-auto">
              Change Method
            </Button>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-border-subtle bg-white">
            <div className="flex items-center justify-between border-b border-border-subtle px-6 py-5">
              <h3 className="font-display text-[18px] font-semibold">Payment History</h3>
              <button className="text-sm font-semibold text-primary hover:underline">View All</button>
            </div>
            <div className="p-6">
              <DataTable
                columns={columns}
                data={paymentRows}
                classNames={{
                  desktopWrapper: 'rounded-none border-0 shadow-none bg-transparent',
                  toolbar: 'hidden',
                }}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="relative mt-12 flex flex-col gap-8 overflow-hidden rounded-[24px] bg-surface-high p-8 md:flex-row md:items-center">
        <div className="relative z-10 md:w-2/3">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-md bg-primary-container p-1 text-white">
              <IconRobot className="size-4" />
            </span>
            <h4 className="font-bold text-primary">Student Finance AI</h4>
          </div>
          <h3 className="font-display text-[22px] font-semibold text-on-surface">
            Need help understanding your financial aid package?
          </h3>
          <p className="mb-6 mt-4 text-on-surface-variant">
            Our intelligent assistant can explain scholarship terms, grant eligibility, or help you
            adjust your monthly payment schedule.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button>Ask Assistant</Button>
            <Button variant="secondary">View FAQ</Button>
          </div>
          <p className="mt-6 text-[11px] italic text-outline">
            Notice: AI Assistant provides guidance based on official student policy documents.
            Official financial decisions are subject to university bursar approval.
          </p>
        </div>
        <div className="flex justify-center md:w-1/3">
          <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-primary/10 bg-primary/5">
            <IconCreditCard className="size-16 text-primary/40" />
            <div className="absolute -right-2 -top-2 rounded-[14px] border border-border-subtle bg-white p-3 shadow-sm">
              <span className="flex items-center gap-1 text-xs font-bold text-success">
                <IconTrendingDown className="size-4" />
                -2% Rate
              </span>
            </div>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
