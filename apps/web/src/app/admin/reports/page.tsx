'use client';

import { IconCalendarEvent, IconDownload, IconFileAnalytics } from '@tabler/icons-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import { AdminShell } from '@/components/admin/admin-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

const cards = [
  { title: 'Enrollment Velocity', detail: 'Daily movement from application to active enrollment.', badge: 'Live' },
  { title: 'Compliance Monitoring', detail: 'Credential, document, and session exception reporting.', badge: 'Priority' },
  { title: 'Audit Readiness', detail: 'Exports prepared for leadership review and regulator response.', badge: 'Ready' },
] as const;

type ExportRow = {
  report: string;
  scope: string;
  cadence: string;
  updated: string;
  status: 'Ready' | 'Queued';
};

const exportsData: ExportRow[] = [
  { report: 'Operational Overview', scope: 'All programs', cadence: 'Daily', updated: '2026-06-28 06:40', status: 'Ready' },
  { report: 'Admissions Queue Audit', scope: 'Applications', cadence: 'Hourly', updated: '2026-06-28 10:05', status: 'Ready' },
  { report: 'Compliance Exception Digest', scope: 'Staff and students', cadence: 'On demand', updated: '2026-06-28 10:12', status: 'Queued' },
];

const columns: DataTableColumn<ExportRow>[] = [
  { id: 'report', header: 'Report', accessorKey: 'report' },
  { id: 'scope', header: 'Scope', accessorKey: 'scope' },
  { id: 'cadence', header: 'Cadence', accessorKey: 'cadence' },
  { id: 'updated', header: 'Last Updated', accessorKey: 'updated' },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <Badge variant={row.status === 'Ready' ? 'success' : 'warning'}>{row.status}</Badge>,
  },
];

// Enrollment trend data (30 days)
const enrollmentTrendData = [
  { date: 'Jun 1', applications: 12, approved: 8, enrolled: 6 },
  { date: 'Jun 4', applications: 18, approved: 12, enrolled: 9 },
  { date: 'Jun 7', applications: 25, approved: 18, enrolled: 14 },
  { date: 'Jun 10', applications: 32, approved: 24, enrolled: 19 },
  { date: 'Jun 13', applications: 38, approved: 28, enrolled: 22 },
  { date: 'Jun 16', applications: 45, approved: 34, enrolled: 27 },
  { date: 'Jun 19', applications: 52, approved: 40, enrolled: 32 },
  { date: 'Jun 22', applications: 58, approved: 45, enrolled: 36 },
  { date: 'Jun 25', applications: 64, approved: 50, enrolled: 41 },
  { date: 'Jun 28', applications: 72, approved: 56, enrolled: 45 },
];

// Application status breakdown
const applicationStatusData = [
  { name: 'Pending Review', value: 16, color: '#006FCF' },
  { name: 'Missing Docs', value: 8, color: '#FFA500' },
  { name: 'Ready', value: 12, color: '#00B66B' },
  { name: 'Approved', value: 56, color: '#2ECC71' },
  { name: 'Rejected', value: 4, color: '#E74C3C' },
];

// Program enrollment comparison
const programEnrollmentData = [
  { program: 'CNA Cohort 12', enrolled: 45, capacity: 50, pending: 8, waitlist: 3 },
  { program: 'CNA Cohort 13', enrolled: 32, capacity: 50, pending: 12, waitlist: 6 },
  { program: 'Medical Assistant', enrolled: 28, capacity: 40, pending: 10, waitlist: 4 },
  { program: 'Radiologic Tech', enrolled: 22, capacity: 35, pending: 7, waitlist: 2 },
  { program: 'HHA Program', enrolled: 18, capacity: 30, pending: 5, waitlist: 3 },
];

// Compliance metrics by program
const complianceData = [
  { program: 'CNA Cohort 12', docs: 94, background: 98, interview: 96, overall: 96 },
  { program: 'CNA Cohort 13', docs: 89, background: 92, interview: 91, overall: 91 },
  { program: 'Medical Assistant', docs: 91, background: 95, interview: 93, overall: 93 },
  { program: 'Radiologic Tech', docs: 95, background: 99, interview: 97, overall: 97 },
  { program: 'HHA Program', docs: 87, background: 90, interview: 88, overall: 88 },
];

// Daily applications data
const dailyApplicationsData = [
  { day: 'Mon', morning: 4, afternoon: 6, evening: 2 },
  { day: 'Tue', morning: 5, afternoon: 8, evening: 3 },
  { day: 'Wed', morning: 3, afternoon: 7, evening: 4 },
  { day: 'Thu', morning: 6, afternoon: 9, evening: 5 },
  { day: 'Fri', morning: 8, afternoon: 11, evening: 6 },
  { day: 'Sat', morning: 2, afternoon: 3, evening: 1 },
  { day: 'Sun', morning: 1, afternoon: 2, evening: 0 },
];

// Processing time by stage
const processingTimeData = [
  { stage: 'Initial Review', avgDays: 2.5, min: 1, max: 5 },
  { stage: 'Doc Collection', avgDays: 5.2, min: 2, max: 10 },
  { stage: 'Background Check', avgDays: 4.8, min: 3, max: 8 },
  { stage: 'Interview', avgDays: 3.1, min: 1, max: 6 },
  { stage: 'Final Approval', avgDays: 1.5, min: 0, max: 3 },
];

export default function AdminReportsPage() {
  return (
    <AdminShell
      title="Admin Reports Suite"
      subtitle="Real-time operational insights and exportable compliance reporting."
      searchPlaceholder="Search reports..."
      topActions={
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="secondary" className="rounded-[16px] px-5">
            <IconCalendarEvent className="size-4" />
            Last 30 Days
          </Button>
          <Button className="rounded-[16px] px-5">
            <IconDownload className="size-4" />
            Export Suite
          </Button>
        </div>
      }
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="rounded-[20px] border border-border-subtle bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/20">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[20px] font-semibold text-on-surface">{card.title}</h3>
                <Badge variant="primary">{card.badge}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">{card.detail}</p>
              <Button variant="secondary" className="mt-5 rounded-[16px] px-5">
                <IconFileAnalytics className="size-4" />
                Open report
              </Button>
            </div>
          ))}
        </div>

        {/* Enrollment Trend Chart */}
        <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <h3 className="mb-4 font-display text-[22px] font-semibold text-on-surface">Enrollment Velocity (30 Days)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={enrollmentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                labelStyle={{ color: '#374151' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="applications" stroke="#006FCF" strokeWidth={2.5} name="Applications Received" dot={{ r: 5 }} />
              <Line type="monotone" dataKey="approved" stroke="#2ECC71" strokeWidth={2.5} name="Approved" dot={{ r: 5 }} />
              <Line type="monotone" dataKey="enrolled" stroke="#8B5CF6" strokeWidth={2.5} name="Enrolled" dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* Two Column Grid for Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Application Status Pie Chart */}
          <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <h3 className="mb-4 font-display text-[22px] font-semibold text-on-surface">Application Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={applicationStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {applicationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  labelStyle={{ color: '#374151' }}
                  formatter={(value) => `${value} applications`}
                />
              </PieChart>
            </ResponsiveContainer>
          </section>

          {/* Daily Applications by Time */}
          <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
            <h3 className="mb-4 font-display text-[22px] font-semibold text-on-surface">Applications by Time of Day</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyApplicationsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  labelStyle={{ color: '#374151' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="morning" fill="#FFA500" name="Morning (8am-12pm)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="afternoon" fill="#006FCF" name="Afternoon (12pm-5pm)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="evening" fill="#8B5CF6" name="Evening (5pm+)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </div>

        {/* Program Enrollment Comparison */}
        <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <h3 className="mb-4 font-display text-[22px] font-semibold text-on-surface">Program Enrollment Status</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={programEnrollmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="program" stroke="#6B7280" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                labelStyle={{ color: '#374151' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="enrolled" fill="#2ECC71" name="Enrolled" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pending" fill="#FFA500" name="Pending" radius={[8, 8, 0, 0]} />
              <Bar dataKey="waitlist" fill="#E74C3C" name="Waitlist" radius={[8, 8, 0, 0]} />
              <Bar dataKey="capacity" fill="#D1D5DB" name="Total Capacity" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Compliance Metrics Area Chart */}
        <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <h3 className="mb-4 font-display text-[22px] font-semibold text-on-surface">Compliance Metrics by Program</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="program" stroke="#6B7280" angle={-30} textAnchor="end" height={80} />
              <YAxis stroke="#6B7280" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                labelStyle={{ color: '#374151' }}
                formatter={(value) => `${value}%`}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area type="monotone" dataKey="docs" stackId="1" stroke="#006FCF" fill="#006FCF" fillOpacity={0.6} name="Documents" />
              <Area type="monotone" dataKey="background" stackId="1" stroke="#2ECC71" fill="#2ECC71" fillOpacity={0.6} name="Background Check" />
              <Area type="monotone" dataKey="interview" stackId="1" stroke="#FFA500" fill="#FFA500" fillOpacity={0.6} name="Interview" />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        {/* Processing Time Analysis */}
        <section className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
          <h3 className="mb-4 font-display text-[22px] font-semibold text-on-surface">Average Processing Time by Stage</h3>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="stage" stroke="#6B7280" name="Processing Stage" />
              <YAxis dataKey="avgDays" stroke="#6B7280" name="Days" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                labelStyle={{ color: '#374151' }}
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value, name) => {
                  if (name === 'avgDays') return `${value.toFixed(1)} days`;
                  return value;
                }}
              />
              <Scatter name="Average Days" data={processingTimeData} fill="#006FCF" />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 grid gap-4 md:grid-cols-5">
            {processingTimeData.map((item) => (
              <div key={item.stage} className="rounded-[12px] bg-surface-muted p-3">
                <p className="text-[11px] font-bold text-on-surface-variant uppercase">{item.stage}</p>
                <p className="mt-2 text-lg font-bold text-primary">{item.avgDays.toFixed(1)}d</p>
                <p className="mt-1 text-[10px] text-on-surface-variant">{item.min}-{item.max} days range</p>
              </div>
            ))}
          </div>
        </section>

        {/* Exports Data Table */}
        <section>
          <h3 className="mb-4 font-display text-[22px] font-semibold text-on-surface">Recent Exports</h3>
          <DataTable
            columns={columns}
            data={exportsData}
            mobileCardTitle={(row) => row.report}
            mobileCardSubtitle={(row) => `${row.scope} / ${row.cadence}`}
            rowActions={() => (
              <Button variant="secondary" className="rounded-[14px] px-4">
                <IconDownload className="size-4" />
                Download
              </Button>
            )}
          />
        </section>
      </div>
    </AdminShell>
  );
}
