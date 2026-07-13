import { redirect } from 'next/navigation';

export default function IntakeSubmissionsRedirectPage() {
  redirect('/admin/applications?tab=intake');
}
