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

// src/types.ts
var types_exports = {};
__export(types_exports, {
  CATEGORIES: () => CATEGORIES,
  FREE_TASK_LIMIT: () => FREE_TASK_LIMIT,
  SCHEDULE_TYPES: () => SCHEDULE_TYPES
});
module.exports = __toCommonJS(types_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CATEGORIES,
  FREE_TASK_LIMIT,
  SCHEDULE_TYPES
});
