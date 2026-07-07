export const MESSAGING_ROLES = ['student', 'instructor', 'admin', 'auditor'] as const;

export type MessagingRole = (typeof MESSAGING_ROLES)[number];

/**
 * Who each role is allowed to start/participate in a direct conversation with.
 * Admins can reach everyone; auditors can only reach admins; students and
 * instructors can reach each other and their own role.
 */
const ALLOWED_COUNTERPART_ROLES: Record<MessagingRole, MessagingRole[]> = {
  student: ['student', 'instructor'],
  instructor: ['student', 'instructor'],
  admin: ['student', 'instructor', 'admin', 'auditor'],
  auditor: ['admin'],
};

function normalizeRole(role: string): MessagingRole {
  return (MESSAGING_ROLES as readonly string[]).includes(role) ? (role as MessagingRole) : 'student';
}

export function getAllowedCounterpartRoles(role: string): MessagingRole[] {
  return ALLOWED_COUNTERPART_ROLES[normalizeRole(role)];
}

export function canRolesMessage(roleA: string, roleB: string): boolean {
  return (
    getAllowedCounterpartRoles(roleA).includes(normalizeRole(roleB)) &&
    getAllowedCounterpartRoles(roleB).includes(normalizeRole(roleA))
  );
}
