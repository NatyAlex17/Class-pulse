'use client';

import { IconCheck, IconSquareRounded } from '@tabler/icons-react';
import { AuditorShell } from '@/components/auditor/auditor-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const programs = [
  {
    name: 'CNA Cohort 12',
    requirements: [
      { item: 'Classroom hours (120)', completed: true },
      { item: 'Clinical hours (480)', completed: true },
      { item: 'Skills assessment', completed: true },
      { item: 'State exam preparation', completed: true },
      { item: 'Capstone project', completed: true },
    ],
    completion: '100%',
  },
  {
    name: 'CNA Cohort 13',
    requirements: [
      { item: 'Classroom hours (120)', completed: true },
      { item: 'Clinical hours (480)', completed: true },
      { item: 'Skills assessment', completed: false },
      { item: 'State exam preparation', completed: true },
      { item: 'Capstone project', completed: false },
    ],
    completion: '60%',
  },
  {
    name: 'Medical Assistant',
    requirements: [
      { item: 'Classroom hours (100)', completed: true },
      { item: 'Clinical hours (360)', completed: true },
      { item: 'Skills assessment', completed: true },
      { item: 'Externship (160)', completed: true },
      { item: 'Certification exam', completed: false },
    ],
    completion: '80%',
  },
];

export default function AuditorProgramRequirementsPage() {
  return (
    <AuditorShell
      title="Program Requirements"
      subtitle="Track program curriculum compliance and completion standards."
    >
      <div className="grid gap-6">
        <section className="space-y-6">
          {programs.map((program) => (
            <div key={program.name} className="rounded-[20px] border border-border-subtle bg-surface p-6 shadow-soft">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-on-surface">{program.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{program.completion}</p>
                  <p className="text-sm text-on-surface-variant">Complete</p>
                </div>
              </div>

              <div className="mb-4 h-2 rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: program.completion }}
                />
              </div>

              <div className="space-y-3">
                {program.requirements.map((req) => (
                  <div key={req.item} className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded ${
                      req.completed
                        ? 'bg-success text-white'
                        : 'border-2 border-border-subtle'
                    }`}>
                      {req.completed && <IconCheck className="h-3 w-3" />}
                    </div>
                    <span className={`text-sm ${req.completed ? 'text-on-surface' : 'text-on-surface-variant line-through'}`}>
                      {req.item}
                    </span>
                  </div>
                ))}
              </div>

              <Button variant="secondary" className="mt-6 rounded-[12px]">
                View Detailed Progress
              </Button>
            </div>
          ))}
        </section>
      </div>
    </AuditorShell>
  );
}
