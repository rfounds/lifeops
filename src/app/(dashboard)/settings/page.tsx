import { getReminderSettings, getAccountInfo } from "@/actions/settings";
import { getUserHousehold, getPendingInvites } from "@/actions/household";
import { SettingsClient } from "./SettingsClient";

export const metadata = {
  title: "Settings - LifeOps",
};

export default async function SettingsPage() {
  const [settings, household, pendingInvites, account] = await Promise.all([
    getReminderSettings(),
    getUserHousehold(),
    getPendingInvites(),
    getAccountInfo(),
  ]);

  return (
    <SettingsClient
      initialSettings={settings}
      household={household}
      pendingInvites={pendingInvites}
      account={account}
    />
  );
}
