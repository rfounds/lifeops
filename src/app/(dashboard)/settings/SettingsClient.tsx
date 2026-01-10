"use client";

import { useState } from "react";
import { updateReminderSettings, updateAccountInfo, changePassword } from "@/actions/settings";
import {
  createHousehold,
  inviteToHousehold,
  leaveHousehold,
  cancelInvite,
  removeMember,
  acceptInvite,
  createInviteLink,
} from "@/actions/household";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HouseholdRole } from "@prisma/client";

type HouseholdMember = {
  id: string;
  role: HouseholdRole;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type HouseholdInvite = {
  id: string;
  email: string;
  expiresAt: Date;
};

type Household = {
  id: string;
  name: string;
  members: HouseholdMember[];
  invites: HouseholdInvite[];
  userRole: HouseholdRole;
};

type PendingInvite = {
  id: string;
  token: string;
  household: {
    name: string;
    members: {
      user: { name: string | null; email: string };
    }[];
  };
};

type AccountInfo = {
  name: string;
  email: string;
  plan: string;
  createdAt: Date;
};

type SettingsClientProps = {
  initialSettings: {
    emailReminders: boolean;
    smsReminders: boolean;
    phoneNumber: string;
    reminderDays: number[];
    isPro: boolean;
  };
  household: Household | null;
  pendingInvites: PendingInvite[];
  account: AccountInfo;
};

const REMINDER_DAY_OPTIONS = [
  { value: 7, label: "7 days before" },
  { value: 3, label: "3 days before" },
  { value: 1, label: "1 day before" },
  { value: 0, label: "Day of" },
];

export function SettingsClient({ initialSettings, household, pendingInvites, account }: SettingsClientProps) {
  const router = useRouter();

  // Account state
  const [name, setName] = useState(account.name);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountMessage, setAccountMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Reminder settings state
  const [emailReminders, setEmailReminders] = useState(initialSettings.emailReminders);
  const [smsReminders, setSmsReminders] = useState(initialSettings.smsReminders);
  const [phoneNumber, setPhoneNumber] = useState(initialSettings.phoneNumber);
  const [reminderDays, setReminderDays] = useState<number[]>(initialSettings.reminderDays);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Household state
  const [householdName, setHouseholdName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [householdLoading, setHouseholdLoading] = useState<string | null>(null);
  const [householdMessage, setHouseholdMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const isPro = initialSettings.isPro;
  const isOwner = household?.userRole === "OWNER";

  async function handleUpdateAccount() {
    setAccountLoading(true);
    setAccountMessage(null);
    const result = await updateAccountInfo({ name });
    if (result.success) {
      setAccountMessage({ type: "success", text: "Account updated successfully!" });
      router.refresh();
    } else {
      setAccountMessage({ type: "error", text: result.error || "Failed to update account" });
    }
    setAccountLoading(false);
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setAccountMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    setAccountLoading(true);
    setAccountMessage(null);
    const result = await changePassword({ currentPassword, newPassword });
    if (result.success) {
      setAccountMessage({ type: "success", text: "Password changed successfully!" });
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setAccountMessage({ type: "error", text: result.error || "Failed to change password" });
    }
    setAccountLoading(false);
  }

  async function handleSave() {
    setLoading(true);
    setMessage(null);

    const result = await updateReminderSettings({
      emailReminders,
      smsReminders,
      phoneNumber,
      reminderDays,
    });

    if (result.success) {
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to save settings" });
    }

    setLoading(false);
  }

  function toggleReminderDay(day: number) {
    setReminderDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleCreateHousehold() {
    setHouseholdLoading("create");
    setHouseholdMessage(null);
    const result = await createHousehold(householdName);
    if (result.success) {
      setHouseholdMessage({ type: "success", text: "Household created!" });
      setHouseholdName("");
      router.refresh();
    } else {
      setHouseholdMessage({ type: "error", text: result.error || "Failed to create household" });
    }
    setHouseholdLoading(null);
  }

  async function handleInvite() {
    setHouseholdLoading("invite");
    setHouseholdMessage(null);
    const result = await inviteToHousehold(inviteEmail);
    if (result.success) {
      setHouseholdMessage({ type: "success", text: "Invite sent!" });
      setInviteEmail("");
      router.refresh();
    } else {
      setHouseholdMessage({ type: "error", text: result.error || "Failed to send invite" });
    }
    setHouseholdLoading(null);
  }

  async function handleLeaveHousehold() {
    if (!confirm("Are you sure you want to leave this household?")) return;
    setHouseholdLoading("leave");
    const result = await leaveHousehold();
    if (result.success) {
      router.refresh();
    } else {
      setHouseholdMessage({ type: "error", text: result.error || "Failed to leave household" });
    }
    setHouseholdLoading(null);
  }

  async function handleCancelInvite(inviteId: string) {
    setHouseholdLoading(`cancel-${inviteId}`);
    const result = await cancelInvite(inviteId);
    if (!result.success) {
      setHouseholdMessage({ type: "error", text: result.error || "Failed to cancel invite" });
    }
    router.refresh();
    setHouseholdLoading(null);
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("Are you sure you want to remove this member?")) return;
    setHouseholdLoading(`remove-${memberId}`);
    const result = await removeMember(memberId);
    if (!result.success) {
      setHouseholdMessage({ type: "error", text: result.error || "Failed to remove member" });
    }
    router.refresh();
    setHouseholdLoading(null);
  }

  async function handleAcceptInvite(token: string) {
    setHouseholdLoading(`accept-${token}`);
    const result = await acceptInvite(token);
    if (result.success) {
      router.refresh();
    } else {
      setHouseholdMessage({ type: "error", text: result.error || "Failed to accept invite" });
    }
    setHouseholdLoading(null);
  }

  async function handleCreateInviteLink() {
    setHouseholdLoading("create-link");
    const result = await createInviteLink();
    if (result.success && result.token) {
      const link = `${window.location.origin}/invite/${result.token}`;
      setInviteLink(link);
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } else {
      setHouseholdMessage({ type: "error", text: result.error || "Failed to create invite link" });
    }
    setHouseholdLoading(null);
  }

  async function handleCopyLink() {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    }
  }

  return (
    <div className="animate-fade-slide-up">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-[rgb(var(--muted-foreground))] mt-2 text-sm sm:text-base">
          Manage your account and preferences
        </p>
      </div>

      {/* Account Section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-[rgb(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Account</h2>
        </div>

        {accountMessage && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-4 ${
              accountMessage.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                : "bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300"
            }`}
          >
            {accountMessage.type === "success" ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {accountMessage.text}
          </div>
        )}

        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-5 sm:p-6 space-y-5">
          {/* Profile Info */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--accent))] flex items-center justify-center text-white text-xl font-semibold">
              {(account.name || account.email)[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-[rgb(var(--foreground))]">
                  {account.name || "No name set"}
                </span>
                {account.plan === "PRO" && (
                  <span className="text-xs font-semibold bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-white px-2 py-0.5 rounded-full">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">{account.email}</p>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                Member since {new Date(account.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Edit Name */}
          <div className="pt-4 border-t border-[rgb(var(--border))]">
            <label className="block text-sm font-medium mb-2 text-[rgb(var(--foreground))]">
              Display Name
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="flex-1 px-3 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent transition-all duration-200"
              />
              <button
                onClick={handleUpdateAccount}
                disabled={accountLoading || name === account.name}
                className="px-5 py-2.5 bg-[rgb(var(--primary))] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
              >
                {accountLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="pt-4 border-t border-[rgb(var(--border))]">
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-sm text-[rgb(var(--primary))] hover:underline font-medium"
              >
                Change password
              </button>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-[rgb(var(--foreground))]">
                  Change Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full px-3 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent transition-all duration-200"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full px-3 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent transition-all duration-200"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent transition-all duration-200"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleChangePassword}
                    disabled={accountLoading || !currentPassword || !newPassword || !confirmPassword}
                    className="px-5 py-2.5 bg-[rgb(var(--primary))] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
                  >
                    {accountLoading ? "Updating..." : "Update Password"}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="px-5 py-2.5 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-[rgb(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Notifications</h2>
      </div>

      {!isPro && (
        <div className="gradient-subtle border border-[rgb(var(--accent)_/_0.2)] rounded-xl p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-[rgb(var(--accent))] text-white text-xs font-semibold rounded-full">
                  PRO
                </span>
                <span className="font-semibold text-[rgb(var(--foreground))]">
                  Unlock Reminders
                </span>
              </div>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                Get email and SMS reminders before your tasks are due.
                Never miss an important deadline again.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-[rgb(var(--primary)_/_0.25)] hover:scale-[1.02] active:scale-[0.98] font-medium transition-all duration-200 text-sm whitespace-nowrap"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`flex items-center gap-3 px-4 py-4 rounded-xl mb-6 ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              : "bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300"
          }`}
        >
          {message.type === "success" ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {message.text}
        </div>
      )}

      <div className={`space-y-6 ${!isPro ? "opacity-50 pointer-events-none" : ""}`}>
        {/* Email Reminders */}
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[rgb(var(--primary)_/_0.1)] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[rgb(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[rgb(var(--foreground))]">Email Reminders</h3>
              </div>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                Receive email notifications before your tasks are due.
              </p>
            </div>
            <button
              onClick={() => setEmailReminders(!emailReminders)}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                emailReminders ? "bg-[rgb(var(--primary))]" : "bg-[rgb(var(--muted))]"
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  emailReminders ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* SMS Reminders */}
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[rgb(var(--primary)_/_0.1)] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[rgb(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[rgb(var(--foreground))]">SMS Reminders</h3>
              </div>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                Receive text message notifications before your tasks are due.
              </p>
            </div>
            <button
              onClick={() => setSmsReminders(!smsReminders)}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                smsReminders ? "bg-[rgb(var(--primary))]" : "bg-[rgb(var(--muted))]"
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  smsReminders ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {smsReminders && (
            <div className="pt-4 border-t border-[rgb(var(--border))]">
              <label className="block text-sm font-medium mb-2 text-[rgb(var(--foreground))]">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent transition-all duration-200"
              />
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
                Enter your phone number with country code
              </p>
            </div>
          )}
        </div>

        {/* Reminder Timing */}
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[rgb(var(--primary)_/_0.1)] flex items-center justify-center">
              <svg className="w-5 h-5 text-[rgb(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-[rgb(var(--foreground))]">Reminder Timing</h3>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                Choose when to receive reminders
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {REMINDER_DAY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => toggleReminderDay(option.value)}
                className={`px-3 py-2.5 text-sm rounded-xl border transition-all duration-200 ${
                  reminderDays.includes(option.value)
                    ? "bg-[rgb(var(--primary))] text-white border-transparent"
                    : "border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading || !isPro}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-white rounded-xl hover:shadow-lg hover:shadow-[rgb(var(--primary)_/_0.25)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none font-medium transition-all duration-200"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>

      {/* Household Sharing Section */}
      <div className="mt-12 pt-8 border-t border-[rgb(var(--border))]">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">Household Sharing</h2>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
            Share tasks with your family or partner
          </p>
        </div>

        {!isPro && (
          <div className="gradient-subtle border border-[rgb(var(--accent)_/_0.2)] rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-[rgb(var(--accent))] text-white text-xs font-semibold rounded-full">
                    PRO
                  </span>
                  <span className="font-semibold text-[rgb(var(--foreground))]">
                    Household Sharing
                  </span>
                </div>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  Create a household and share tasks with family members.
                  Everyone stays on top of life admin together.
                </p>
              </div>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-[rgb(var(--primary)_/_0.25)] hover:scale-[1.02] active:scale-[0.98] font-medium transition-all duration-200 text-sm whitespace-nowrap"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        )}

        {isPro && (
          <div className="space-y-6">
            {householdMessage && (
              <div
                className={`flex items-center gap-3 px-4 py-4 rounded-xl ${
                  householdMessage.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                    : "bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300"
                }`}
              >
                {householdMessage.type === "success" ? (
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {householdMessage.text}
              </div>
            )}

            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
              <div className="bg-[rgb(var(--primary)_/_0.05)] border border-[rgb(var(--primary)_/_0.2)] rounded-xl p-5">
                <h3 className="font-semibold text-[rgb(var(--foreground))] mb-3">Pending Invitations</h3>
                <div className="space-y-3">
                  {pendingInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between gap-4 bg-[rgb(var(--card))] rounded-lg p-3">
                      <div>
                        <p className="font-medium text-[rgb(var(--foreground))]">{invite.household.name}</p>
                        <p className="text-sm text-[rgb(var(--muted-foreground))]">
                          Invited by {invite.household.members[0]?.user.name || invite.household.members[0]?.user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAcceptInvite(invite.token)}
                        disabled={householdLoading === `accept-${invite.token}`}
                        className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm font-medium"
                      >
                        {householdLoading === `accept-${invite.token}` ? "Joining..." : "Accept"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!household ? (
              /* Create Household */
              <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgb(var(--primary)_/_0.1)] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[rgb(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[rgb(var(--foreground))]">Create a Household</h3>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      Start sharing tasks with your family
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    placeholder="Household name (e.g., The Smiths)"
                    className="flex-1 px-3 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent transition-all duration-200"
                  />
                  <button
                    onClick={handleCreateHousehold}
                    disabled={householdLoading === "create"}
                    className="px-5 py-2.5 bg-[rgb(var(--primary))] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
                  >
                    {householdLoading === "create" ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            ) : (
              /* Manage Household */
              <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[rgb(var(--primary)_/_0.1)] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[rgb(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[rgb(var(--foreground))]">{household.name}</h3>
                      <p className="text-sm text-[rgb(var(--muted-foreground))]">
                        {household.members.length} member{household.members.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLeaveHousehold}
                    disabled={householdLoading === "leave"}
                    className="text-sm text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    {householdLoading === "leave" ? "Leaving..." : isOwner ? "Delete" : "Leave"}
                  </button>
                </div>

                {/* Members */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-[rgb(var(--muted-foreground))] mb-3">Members</h4>
                  <div className="space-y-2">
                    {household.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between gap-4 bg-[rgb(var(--muted)_/_0.3)] rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white text-sm font-medium">
                            {(member.user.name || member.user.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-[rgb(var(--foreground))] text-sm">
                              {member.user.name || member.user.email}
                              {member.role === "OWNER" && (
                                <span className="ml-2 text-xs text-[rgb(var(--primary))]">Owner</span>
                              )}
                            </p>
                            {member.user.name && (
                              <p className="text-xs text-[rgb(var(--muted-foreground))]">{member.user.email}</p>
                            )}
                          </div>
                        </div>
                        {isOwner && member.role !== "OWNER" && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={householdLoading === `remove-${member.id}`}
                            className="text-sm text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Invites for this household */}
                {isOwner && household.invites.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-[rgb(var(--muted-foreground))] mb-3">Pending Invites</h4>
                    <div className="space-y-2">
                      {household.invites.map((invite) => (
                        <div key={invite.id} className="flex items-center justify-between gap-4 bg-[rgb(var(--muted)_/_0.3)] rounded-lg p-3">
                          <p className="text-sm text-[rgb(var(--foreground))]">{invite.email}</p>
                          <button
                            onClick={() => handleCancelInvite(invite.id)}
                            disabled={householdLoading === `cancel-${invite.id}`}
                            className="text-sm text-[rgb(var(--muted-foreground))] hover:text-red-500 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invite New Member */}
                {isOwner && (
                  <div className="pt-4 border-t border-[rgb(var(--border))]">
                    <h4 className="text-sm font-medium text-[rgb(var(--foreground))] mb-3">Invite a Member</h4>

                    {/* Invite Link */}
                    <div className="mb-4">
                      <button
                        onClick={handleCreateInviteLink}
                        disabled={householdLoading === "create-link"}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[rgb(var(--muted))] hover:bg-[rgb(var(--muted)_/_0.8)] border border-[rgb(var(--border))] rounded-xl transition-colors disabled:opacity-50 font-medium text-[rgb(var(--foreground))]"
                      >
                        {householdLoading === "create-link" ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Creating link...
                          </>
                        ) : linkCopied ? (
                          <>
                            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Link copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                            </svg>
                            Create Invite Link
                          </>
                        )}
                      </button>
                      {inviteLink && (
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            value={inviteLink}
                            readOnly
                            className="flex-1 px-3 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg text-sm text-[rgb(var(--muted-foreground))]"
                          />
                          <button
                            onClick={handleCopyLink}
                            className="px-3 py-2 bg-[rgb(var(--muted))] hover:bg-[rgb(var(--muted)_/_0.8)] border border-[rgb(var(--border))] rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                            </svg>
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
                        Share this link with anyone to invite them (expires in 7 days)
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[rgb(var(--border))]" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-[rgb(var(--card))] text-[rgb(var(--muted-foreground))]">or invite by email</span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Email address"
                        className="flex-1 px-3 py-2.5 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent transition-all duration-200"
                      />
                      <button
                        onClick={handleInvite}
                        disabled={householdLoading === "invite" || !inviteEmail}
                        className="px-5 py-2.5 bg-[rgb(var(--primary))] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
                      >
                        {householdLoading === "invite" ? "Sending..." : "Invite"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
