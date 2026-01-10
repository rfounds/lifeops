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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CATEGORIES: () => CATEGORIES,
  FREE_TASK_LIMIT: () => FREE_TASK_LIMIT,
  SCHEDULE_TYPES: () => SCHEDULE_TYPES,
  calculateNextDueDate: () => calculateNextDueDate,
  changePasswordSchema: () => changePasswordSchema,
  getScheduleDescription: () => getScheduleDescription,
  loginSchema: () => loginSchema,
  parseMMDD: () => parseMMDD,
  registerSchema: () => registerSchema,
  taskSchema: () => taskSchema,
  templates: () => templates,
  toMMDD: () => toMMDD,
  updateAccountSchema: () => updateAccountSchema
});
module.exports = __toCommonJS(index_exports);

// src/types.ts
var FREE_TASK_LIMIT = 5;
var CATEGORIES = [
  { value: "FINANCE", label: "Finance", emoji: "\u{1F4B0}" },
  { value: "LEGAL", label: "Legal", emoji: "\u{1F4CB}" },
  { value: "HOME", label: "Home", emoji: "\u{1F3E0}" },
  { value: "HEALTH", label: "Health", emoji: "\u{1F3E5}" },
  { value: "DIGITAL", label: "Digital", emoji: "\u{1F4BB}" },
  { value: "OTHER", label: "Other", emoji: "\u{1F4CC}" }
];
var SCHEDULE_TYPES = [
  { value: "FIXED_DATE", label: "One-time" },
  { value: "EVERY_N_MONTHS", label: "Every N months" },
  { value: "YEARLY", label: "Yearly on specific date" }
];

// src/validations.ts
var import_zod = require("zod");
var registerSchema = import_zod.z.object({
  name: import_zod.z.string().min(2, "Name must be at least 2 characters"),
  email: import_zod.z.string().email("Invalid email address"),
  password: import_zod.z.string().min(6, "Password must be at least 6 characters")
});
var loginSchema = import_zod.z.object({
  email: import_zod.z.string().email("Invalid email address"),
  password: import_zod.z.string().min(1, "Password is required")
});
var taskSchema = import_zod.z.object({
  title: import_zod.z.string().min(1, "Title is required").max(200, "Title too long"),
  category: import_zod.z.enum(["FINANCE", "LEGAL", "HOME", "HEALTH", "DIGITAL", "OTHER"]),
  scheduleType: import_zod.z.enum(["FIXED_DATE", "EVERY_N_MONTHS", "YEARLY"]),
  scheduleValue: import_zod.z.number().int().positive().nullable(),
  nextDueDate: import_zod.z.string(),
  notes: import_zod.z.string().max(1e3, "Notes too long").nullable().optional(),
  cost: import_zod.z.number().positive().nullable().optional(),
  shareWithHousehold: import_zod.z.boolean().optional()
});
var changePasswordSchema = import_zod.z.object({
  currentPassword: import_zod.z.string().min(1, "Current password is required"),
  newPassword: import_zod.z.string().min(6, "New password must be at least 6 characters")
});
var updateAccountSchema = import_zod.z.object({
  name: import_zod.z.string().min(2, "Name must be at least 2 characters")
});

// src/schedule-utils.ts
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

// src/templates-data.ts
var templates = [
  {
    id: "annual-life-admin",
    name: "Annual Life Admin Checklist",
    description: "Essential yearly tasks for keeping your life organized",
    tasks: [
      {
        title: "Review and update insurance policies",
        category: "FINANCE",
        scheduleType: "YEARLY",
        scheduleValue: toMMDD(1, 15),
        // Jan 15
        notes: "Review home, auto, health, and life insurance coverage"
      },
      {
        title: "File taxes",
        category: "FINANCE",
        scheduleType: "YEARLY",
        scheduleValue: toMMDD(4, 1),
        // Apr 1
        notes: "Gather documents and file federal/state taxes"
      },
      {
        title: "Review retirement contributions",
        category: "FINANCE",
        scheduleType: "YEARLY",
        scheduleValue: toMMDD(1, 1),
        // Jan 1
        notes: "Maximize 401k/IRA contributions for the year"
      },
      {
        title: "Annual health checkup",
        category: "HEALTH",
        scheduleType: "YEARLY",
        scheduleValue: toMMDD(3, 1),
        // Mar 1
        notes: "Schedule and complete annual physical"
      },
      {
        title: "Dental cleaning",
        category: "HEALTH",
        scheduleType: "EVERY_N_MONTHS",
        scheduleValue: 6,
        notes: "Regular dental checkup and cleaning"
      },
      {
        title: "Update emergency contacts",
        category: "OTHER",
        scheduleType: "YEARLY",
        scheduleValue: toMMDD(1, 1),
        // Jan 1
        notes: "Review and update emergency contact information everywhere"
      }
    ]
  },
  {
    id: "freelancer-admin",
    name: "Freelancer Admin Checklist",
    description: "Stay on top of your freelance business admin",
    tasks: [
      {
        title: "Quarterly estimated tax payment",
        category: "FINANCE",
        scheduleType: "EVERY_N_MONTHS",
        scheduleValue: 3,
        notes: "Pay federal and state estimated taxes"
      },
      {
        title: "Review business expenses",
        category: "FINANCE",
        scheduleType: "EVERY_N_MONTHS",
        scheduleValue: 1,
        notes: "Categorize and track all business expenses"
      },
      {
        title: "Invoice follow-up",
        category: "FINANCE",
        scheduleType: "EVERY_N_MONTHS",
        scheduleValue: 1,
        notes: "Follow up on unpaid invoices"
      },
      {
        title: "Update portfolio/website",
        category: "DIGITAL",
        scheduleType: "EVERY_N_MONTHS",
        scheduleValue: 3,
        notes: "Add recent work and update testimonials"
      },
      {
        title: "Review contracts and rates",
        category: "LEGAL",
        scheduleType: "YEARLY",
        scheduleValue: toMMDD(1, 1),
        // Jan 1
        notes: "Review contract templates and consider rate increases"
      },
      {
        title: "Backup client files",
        category: "DIGITAL",
        scheduleType: "EVERY_N_MONTHS",
        scheduleValue: 1,
        notes: "Ensure all client work is properly backed up"
      }
    ]
  },
  {
    id: "digital-life",
    name: "Digital Life Checklist",
    description: "Keep your digital life secure and organized",
    tasks: [
      {
        title: "Review and update passwords",
        category: "DIGITAL",
        scheduleType: "EVERY_N_MONTHS",
        scheduleValue: 6,
        notes: "Rotate important passwords and review password manager"
      },
      {
        title: "Review app subscriptions",
        category: "DIGITAL",
        scheduleType: "EVERY_N_MONTHS",
        scheduleValue: 3,
        notes: "Cancel unused subscriptions and review spending"
      },
      {
        title: "Backup important data",
        category: "DIGITAL",
        scheduleType: "EVERY_N_MONTHS",
        scheduleValue: 1,
        notes: "Backup photos, documents, and important files"
      },
      {
        title: "Review privacy settings",
        category: "DIGITAL",
        scheduleType: "EVERY_N_MONTHS",
        scheduleValue: 6,
        notes: "Check privacy settings on social media and accounts"
      },
      {
        title: "Clean up email inbox",
        category: "DIGITAL",
        scheduleType: "EVERY_N_MONTHS",
        scheduleValue: 3,
        notes: "Unsubscribe from newsletters and organize folders"
      },
      {
        title: "Update devices and software",
        category: "DIGITAL",
        scheduleType: "EVERY_N_MONTHS",
        scheduleValue: 1,
        notes: "Install updates on all devices"
      }
    ]
  }
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CATEGORIES,
  FREE_TASK_LIMIT,
  SCHEDULE_TYPES,
  calculateNextDueDate,
  changePasswordSchema,
  getScheduleDescription,
  loginSchema,
  parseMMDD,
  registerSchema,
  taskSchema,
  templates,
  toMMDD,
  updateAccountSchema
});
