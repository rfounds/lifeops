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

// src/validations.ts
var validations_exports = {};
__export(validations_exports, {
  changePasswordSchema: () => changePasswordSchema,
  loginSchema: () => loginSchema,
  registerSchema: () => registerSchema,
  taskSchema: () => taskSchema,
  updateAccountSchema: () => updateAccountSchema
});
module.exports = __toCommonJS(validations_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  taskSchema,
  updateAccountSchema
});
