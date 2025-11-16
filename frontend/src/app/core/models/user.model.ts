export enum UserRole {
  ATTENDANT = 'ATTENDANT',
  SALES_MANAGER = 'SALES_MANAGER',
  ADMIN = 'ADMIN',
  VIEW_ONLY = 'VIEW_ONLY'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  tenant?: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}
