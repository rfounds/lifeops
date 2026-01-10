// Re-export from shared package
export * from "@lifeops/shared/validations";

// Web-specific: Transform date string to Date object for server actions
import { z } from "zod";

export const taskSchemaWithDateTransform = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  category: z.enum(["FINANCE", "LEGAL", "HOME", "HEALTH", "DIGITAL", "OTHER"]),
  scheduleType: z.enum(["FIXED_DATE", "EVERY_N_MONTHS", "YEARLY"]),
  scheduleValue: z.number().int().positive().nullable(),
  // Parse date as local noon to avoid timezone boundary issues
  nextDueDate: z.string().transform((val) => {
    // Add T12:00:00 to treat as local noon, avoiding timezone shifts
    const date = new Date(`${val}T12:00:00`);
    return date;
  }),
  notes: z.string().max(1000, "Notes too long").nullable(),
});
