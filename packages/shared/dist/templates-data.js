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

// src/templates-data.ts
var templates_data_exports = {};
__export(templates_data_exports, {
  templates: () => templates
});
module.exports = __toCommonJS(templates_data_exports);

// src/schedule-utils.ts
var import_date_fns = require("date-fns");
function toMMDD(month, day) {
  return month * 100 + day;
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
  templates
});
