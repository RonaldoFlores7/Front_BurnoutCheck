export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  lastname?: string;
  phone?: string;
  role: 'user' | 'admin';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserDetail extends User {
  total_tests: number;
  completed_tests: number;
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  name?: string;
  lastname?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}
