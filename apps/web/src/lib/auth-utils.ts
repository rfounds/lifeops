import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      createdAt: true,
    },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function getTaskCount(userId: string): Promise<number> {
  return prisma.task.count({ where: { userId } });
}

export async function canCreateTask(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (!user) return false;
  if (user.plan === "PRO") return true;

  const taskCount = await getTaskCount(userId);
  return taskCount < 5; // Free tier limit
}

export const FREE_TASK_LIMIT = 5;
