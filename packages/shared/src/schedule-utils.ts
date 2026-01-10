import { addMonths, setMonth, setDate, addYears, startOfDay } from "date-fns";
import type { ScheduleType } from "./types";

/**
 * Calculate the next due date based on schedule type
 */
export function calculateNextDueDate(
  scheduleType: ScheduleType,
  scheduleValue: number | null,
  currentDueDate: Date,
  fromDate: Date = new Date()
): Date {
  const today = startOfDay(fromDate);

  switch (scheduleType) {
    case "FIXED_DATE":
      // Fixed date doesn't recur - return the same date
      return currentDueDate;

    case "EVERY_N_MONTHS":
      if (!scheduleValue || scheduleValue < 1) {
        throw new Error("EVERY_N_MONTHS requires a positive scheduleValue");
      }
      // Add N months from the current due date (preserving the day of month)
      const nextMonthDate = addMonths(currentDueDate, scheduleValue);
      // Set to noon to avoid timezone issues
      nextMonthDate.setHours(12, 0, 0, 0);
      return nextMonthDate;

    case "YEARLY":
      if (!scheduleValue) {
        throw new Error("YEARLY requires a scheduleValue (MMDD format)");
      }
      // scheduleValue is MMDD format (e.g., 115 for Jan 15, 1225 for Dec 25)
      const month = Math.floor(scheduleValue / 100) - 1; // 0-indexed month
      const day = scheduleValue % 100;

      let nextDate = setDate(setMonth(today, month), day);
      // Set to noon to avoid timezone issues
      nextDate.setHours(12, 0, 0, 0);

      // If the date has passed this year, schedule for next year
      if (nextDate <= today) {
        nextDate = addYears(nextDate, 1);
        nextDate.setHours(12, 0, 0, 0);
      }

      return nextDate;

    default:
      throw new Error(`Unknown schedule type: ${scheduleType}`);
  }
}

/**
 * Parse MMDD integer to month and day
 */
export function parseMMDD(mmdd: number): { month: number; day: number } {
  const month = Math.floor(mmdd / 100);
  const day = mmdd % 100;
  return { month, day };
}

/**
 * Create MMDD integer from month and day
 */
export function toMMDD(month: number, day: number): number {
  return month * 100 + day;
}

/**
 * Get human-readable schedule description
 */
export function getScheduleDescription(
  scheduleType: ScheduleType,
  scheduleValue: number | null
): string {
  switch (scheduleType) {
    case "FIXED_DATE":
      return "One-time";

    case "EVERY_N_MONTHS":
      if (!scheduleValue) return "Recurring";
      if (scheduleValue === 1) return "Monthly";
      if (scheduleValue === 3) return "Quarterly";
      if (scheduleValue === 6) return "Every 6 months";
      if (scheduleValue === 12) return "Yearly";
      return `Every ${scheduleValue} months`;

    case "YEARLY":
      if (!scheduleValue) return "Yearly";
      const { month, day } = parseMMDD(scheduleValue);
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      return `Yearly on ${monthNames[month - 1]} ${day}`;

    default:
      return "Unknown";
  }
}
