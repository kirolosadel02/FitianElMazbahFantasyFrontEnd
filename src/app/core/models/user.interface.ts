// User roles enum
export enum UserRole {
  User = 'User',
  Admin = 'Admin'
}

// User interface
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// Update user DTO
export interface UpdateUserDto {
  username?: string;
  email?: string;
  role?: UserRole;
}
