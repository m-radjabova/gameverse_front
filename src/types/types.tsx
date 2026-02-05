export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string | null;
  confirmPassword: string;
  roles: string[],
  uid: string;
}