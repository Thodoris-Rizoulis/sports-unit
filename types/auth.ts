import { z } from "zod";
import {
  emailField,
  passwordField,
  loginPasswordField,
  usernameBase,
  roleIdField,
} from "./common";

// ========================================
// Auth Input Validation Schemas
// For validating user input in forms and API requests
// ========================================

// Unified register schema (for both form and API validation)
export const registerSchema = z.object({
  email: emailField,
  password: passwordField,
  username: usernameBase,
  roleId: roleIdField,
});
export type RegisterInput = z.infer<typeof registerSchema>;

// Login form schema
export const loginFormSchema = z.object({
  email: emailField,
  password: loginPasswordField,
});
export type LoginForm = z.infer<typeof loginFormSchema>;
