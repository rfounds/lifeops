import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  category: z.enum(["FINANCE", "LEGAL", "HOME", "HEALTH", "DIGITAL", "OTHER"]),
  scheduleType: z.enum(["FIXED_DATE", "EVERY_N_MONTHS", "YEARLY"]),
  scheduleValue: z.number().int().positive().nullable(),
  nextDueDate: z.string(),
  notes: z.string().max(1000, "Notes too long").nullable().optional(),
  cost: z.number().positive().nullable().optional(),
  shareWithHousehold: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const updateAccountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
