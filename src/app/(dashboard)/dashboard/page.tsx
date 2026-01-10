import { requireAuth, canCreateTask, getTaskCount, FREE_TASK_LIMIT } from "@/lib/auth-utils";
import { getUserTasks, getUserHouseholdId } from "@/actions/tasks";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const user = await requireAuth();

  const [tasks, householdId, canCreate, taskCount] = await Promise.all([
    getUserTasks(),
    getUserHouseholdId(),
    canCreateTask(user.id),
    getTaskCount(user.id),
  ]);

  const isPro = user.plan === "PRO";

  return (
    <DashboardClient
      initialTasks={tasks}
      canCreate={canCreate}
      taskCount={taskCount}
      taskLimit={isPro ? null : FREE_TASK_LIMIT}
      householdId={householdId}
      currentUserId={user.id}
    />
  );
}
