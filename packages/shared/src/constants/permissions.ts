export const PERMISSIONS = {
  READ_USERS: 'read:users',
  WRITE_USERS: 'write:users',
  READ_ENROLLMENTS: 'read:enrollments',
  WRITE_ENROLLMENTS: 'write:enrollments',
  READ_ATTENDANCE: 'read:attendance',
  WRITE_ATTENDANCE: 'write:attendance',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
