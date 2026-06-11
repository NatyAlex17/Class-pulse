export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  disabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
