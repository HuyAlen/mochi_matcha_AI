export type UserRole = "dad" | "mom" | "grandparent" | "caregiver" | "admin";

export interface AppUser {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  role?: UserRole;
  createdAt?: string;
}
