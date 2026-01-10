import { ScheduleType } from './types.js';

/**
 * Calculate the next due date based on schedule type
 */
declare function calculateNextDueDate(scheduleType: ScheduleType, scheduleValue: number | null, currentDueDate: Date, fromDate?: Date): Date;
/**
 * Parse MMDD integer to month and day
 */
declare function parseMMDD(mmdd: number): {
    month: number;
    day: number;
};
/**
 * Create MMDD integer from month and day
 */
declare function toMMDD(month: number, day: number): number;
/**
 * Get human-readable schedule description
 */
declare function getScheduleDescription(scheduleType: ScheduleType, scheduleValue: number | null): string;

export { calculateNextDueDate, getScheduleDescription, parseMMDD, toMMDD };
