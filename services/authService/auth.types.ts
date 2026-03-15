// Khớp với generateAuthResponse trong auth.service.ts
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  email: string;
  fullName: string;
  role: string;
  isNewUser: boolean;
}

// Khớp với LoginDto
export interface LoginPayload {
  email: string;
  password: string;
}

// Khớp với CreateUserDto
export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}