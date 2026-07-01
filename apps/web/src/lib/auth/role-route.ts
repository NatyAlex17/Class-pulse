export type AppRole = 'student' | 'instructor' | 'admin' | 'auditor';

const roleRoutes: Record<AppRole, string> = {
  student: '/student/dashboard',
  instructor: '/instructor/dashboard',
  admin: '/admin/dashboard',
  auditor: '/auditor/dashboard',
};

export function normalizeAppRole(value: string | null | undefined): AppRole {
  const normalized = value?.trim().toLowerCase();

  if (
    normalized === 'student' ||
    normalized === 'instructor' ||
    normalized === 'admin' ||
    normalized === 'auditor'
  ) {
    return normalized;
  }

  return 'student';
}

export function getRoleRoute(role: string | null | undefined) {
  return roleRoutes[normalizeAppRole(role)];
}
