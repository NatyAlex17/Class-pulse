import { redirect } from 'next/navigation';

export default function InstructorIntakeSubmissionsRedirectPage() {
  redirect('/admin/applications?tab=instructor');
}
