// packages/shared/src/constants/roles.ts

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  STUDENT: 'STUDENT',
  COMPLIANCE_OFFICER: 'COMPLIANCE_OFFICER',
  AUDITOR: 'AUDITOR',
} as const;

export type UserRole = keyof typeof USER_ROLES;
