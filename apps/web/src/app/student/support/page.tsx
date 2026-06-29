import { IconArrowRight, IconHelpCircle, IconMail, IconPhone } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StudentShell } from '@/components/student/student-shell';

export default function StudentSupportPage() {
  return (
    <StudentShell
      title="Support"
      subtitle="Get help with access, coursework, documents, and compliance questions."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'Program Support',
            description: 'Contact the operations team for account, scheduling, and enrollment questions.',
            icon: IconHelpCircle,
          },
          {
            title: 'Email Assistance',
            description: 'support@classverse.edu',
            icon: IconMail,
          },
          {
            title: 'Call Center',
            description: '+1 (555) 010-2024',
            icon: IconPhone,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="rounded-[14px]">
                  Open
                  <IconArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </StudentShell>
  );
}
