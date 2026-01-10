import { z } from 'zod';

declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
declare const taskSchema: z.ZodObject<{
    title: z.ZodString;
    category: z.ZodEnum<{
        FINANCE: "FINANCE";
        LEGAL: "LEGAL";
        HOME: "HOME";
        HEALTH: "HEALTH";
        DIGITAL: "DIGITAL";
        OTHER: "OTHER";
    }>;
    scheduleType: z.ZodEnum<{
        FIXED_DATE: "FIXED_DATE";
        EVERY_N_MONTHS: "EVERY_N_MONTHS";
        YEARLY: "YEARLY";
    }>;
    scheduleValue: z.ZodNullable<z.ZodNumber>;
    nextDueDate: z.ZodString;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    shareWithHousehold: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
declare const updateAccountSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type TaskInput = z.infer<typeof taskSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export { type ChangePasswordInput, type LoginInput, type RegisterInput, type TaskInput, type UpdateAccountInput, changePasswordSchema, loginSchema, registerSchema, taskSchema, updateAccountSchema };
