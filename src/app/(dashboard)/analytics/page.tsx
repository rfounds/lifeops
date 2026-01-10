import { getAnalytics } from "@/actions/analytics";
import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { AnalyticsClient } from "./AnalyticsClient";

export const metadata = {
  title: "Analytics - LifeOps",
};

export default async function AnalyticsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Analytics is a Pro feature
  if (user.plan !== "PRO") {
    redirect("/pricing?feature=analytics");
  }

  const analytics = await getAnalytics();

  return <AnalyticsClient analytics={analytics} />;
}
