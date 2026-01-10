"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/schedule-utils.ts
var schedule_utils_exports = {};
__export(schedule_utils_exports, {
  calculateNextDueDate: () => calculateNextDueDate,
  getScheduleDescription: () => getScheduleDescription,
  parseMMDD: () => parseMMDD,
  toMMDD: () => toMMDD
});
module.exports = __toCommonJS(schedule_utils_exports);
var import_date_fns = require("date-fns");
function calculateNextDueDate(scheduleType, scheduleValue, currentDueDate, fromDate = /* @__PURE__ */ new Date()) {
  const today = (0, import_date_fns.startOfDay)(fromDate);
  switch (scheduleType) {
    case "FIXED_DATE":
      return currentDueDate;
    case "EVERY_N_MONTHS":
      if (!scheduleValue || scheduleValue < 1) {
        throw new Error("EVERY_N_MONTHS requires a positive scheduleValue");
      }
      const nextMonthDate = (0, import_date_fns.addMonths)(currentDueDate, scheduleValue);
      nextMonthDate.setHours(12, 0, 0, 0);
      return nextMonthDate;
    case "YEARLY":
      if (!scheduleValue) {
        throw new Error("YEARLY requires a scheduleValue (MMDD format)");
      }
      const month = Math.floor(scheduleValue / 100) - 1;
      const day = scheduleValue % 100;
      let nextDate = (0, import_date_fns.setDate)((0, import_date_fns.setMonth)(today, month), day);
      nextDate.setHours(12, 0, 0, 0);
      if (nextDate <= today) {
        nextDate = (0, import_date_fns.addYears)(nextDate, 1);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  calculateNextDueDate,
  getScheduleDescription,
  parseMMDD,
  toMMDD
});
