// src/schedule-utils.ts
import { addMonths, setMonth, setDate, addYears, startOfDay } from "date-fns";
function calculateNextDueDate(scheduleType, scheduleValue, currentDueDate, fromDate = /* @__PURE__ */ new Date()) {
  const today = startOfDay(fromDate);
  switch (scheduleType) {
    case "FIXED_DATE":
      return currentDueDate;
    case "EVERY_N_MONTHS":
      if (!scheduleValue || scheduleValue < 1) {
        throw new Error("EVERY_N_MONTHS requires a positive scheduleValue");
      }
      const nextMonthDate = addMonths(currentDueDate, scheduleValue);
      nextMonthDate.setHours(12, 0, 0, 0);
      return nextMonthDate;
    case "YEARLY":
      if (!scheduleValue) {
        throw new Error("YEARLY requires a scheduleValue (MMDD format)");
      }
      const month = Math.floor(scheduleValue / 100) - 1;
      const day = scheduleValue % 100;
      let nextDate = setDate(setMonth(today, month), day);
      nextDate.setHours(12, 0, 0, 0);
      if (nextDate <= today) {
        nextDate = addYears(nextDate, 1);
        nextDate.setHours(12, 0, 0, 0);
      }
      return nextDate;
    default:
      throw new Error(`Unknown schedule type: ${scheduleType}`);
  }
}
function parseMMDD(mmdd) {
  const month = Math.floor(mmdd / 100);
  const day = mmdd % 100;
  return { month, day };
}
function toMMDD(month, day) {
  return month * 100 + day;
}
function getScheduleDescription(scheduleType, scheduleValue) {
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
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];
      return `Yearly on ${monthNames[month - 1]} ${day}`;
    default:
      return "Unknown";
  }
}

export {
  calculateNextDueDate,
  parseMMDD,
  toMMDD,
  getScheduleDescription
};
