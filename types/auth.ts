import { z } from "zod";
import {
  emailField,
  passwordField,
  loginPasswordField,
  hashedPasswordField,
  usernameBase,
  idField,
  roleIdField,
  onboardingCompleteField,
} from "./common";

// ========================================
// Auth Schemas and Types
// ========================================

// Unified register schema (for both form and API validation)
export const registerSchema = z.object({
  email: emailField,
  password: passwordField,
  username: usernameBase,
  roleId: roleIdField,
});
export type RegisterInput = z.infer<typeof registerSchema>;

// User schema (for DB/auth operations)
export const userSchema = z.object({
  id: idField,
  email: emailField,
  name: usernameBase,
  roleId: idField,
  onboardingComplete: onboardingCompleteField,
  password: hashedPasswordField,
});
export type User = z.infer<typeof userSchema>;

// ========================================
// Form Schemas and Types (for UI components)
// ========================================

// Login form schema
export const loginFormSchema = z.object({
  email: emailField,
  password: loginPasswordField,
});
export type LoginForm = z.infer<typeof loginFormSchema>;
