"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";

export type HouseholdActionResult = {
  success: boolean;
  error?: string;
  householdId?: string;
};

export async function createHousehold(name: string): Promise<HouseholdActionResult> {
  const user = await requireAuth();

  // Check if user is Pro
  if (user.plan !== "PRO") {
    return { success: false, error: "Household sharing is a Pro feature" };
  }

  // Check if user is already in a household
  const existingMembership = await prisma.householdMember.findFirst({
    where: { userId: user.id },
  });

  if (existingMembership) {
    return { success: false, error: "You're already in a household" };
  }

  try {
    const household = await prisma.household.create({
      data: {
        name: name.trim() || "My Household",
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true, householdId: household.id };
  } catch (error) {
    console.error("Create household error:", error);
    return { success: false, error: "Failed to create household" };
  }
}

export async function inviteToHousehold(email: string): Promise<HouseholdActionResult> {
  const user = await requireAuth();

  if (user.plan !== "PRO") {
    return { success: false, error: "Household sharing is a Pro feature" };
  }

  // Get user's household where they are owner
  const membership = await prisma.householdMember.findFirst({
    where: { userId: user.id, role: "OWNER" },
    include: { household: true },
  });

  if (!membership) {
    return { success: false, error: "You must be a household owner to invite members" };
  }

  // Check if email is already a member
  const existingMember = await prisma.householdMember.findFirst({
    where: {
      householdId: membership.householdId,
      user: { email: email.toLowerCase() },
    },
  });

  if (existingMember) {
    return { success: false, error: "This person is already in your household" };
  }

  // Check if invite already exists
  const existingInvite = await prisma.householdInvite.findFirst({
    where: {
      householdId: membership.householdId,
      email: email.toLowerCase(),
    },
  });

  if (existingInvite) {
    return { success: false, error: "An invite has already been sent to this email" };
  }

  try {
    await prisma.householdInvite.create({
      data: {
        householdId: membership.householdId,
        email: email.toLowerCase(),
        invitedBy: user.id,
        expiresAt: addDays(new Date(), 7),
      },
    });

    // TODO: Send invite email

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Invite to household error:", error);
    return { success: false, error: "Failed to send invite" };
  }
}

export async function acceptInvite(token: string): Promise<HouseholdActionResult> {
  const user = await requireAuth();

  const invite = await prisma.householdInvite.findUnique({
    where: { token },
    include: { household: true },
  });

  if (!invite) {
    return { success: false, error: "Invalid invite link" };
  }

  if (invite.expiresAt < new Date()) {
    return { success: false, error: "This invite has expired" };
  }

  if (invite.email !== user.email.toLowerCase()) {
    return { success: false, error: "This invite was sent to a different email address" };
  }

  // Check if user is already in a household
  const existingMembership = await prisma.householdMember.findFirst({
    where: { userId: user.id },
  });

  if (existingMembership) {
    return { success: false, error: "You're already in a household" };
  }

  try {
    await prisma.$transaction([
      prisma.householdMember.create({
        data: {
          householdId: invite.householdId,
          userId: user.id,
          role: "MEMBER",
        },
      }),
      prisma.householdInvite.delete({
        where: { id: invite.id },
      }),
    ]);

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true, householdId: invite.householdId };
  } catch (error) {
    console.error("Accept invite error:", error);
    return { success: false, error: "Failed to join household" };
  }
}

export async function acceptInviteByToken(token: string): Promise<HouseholdActionResult> {
  const user = await requireAuth();

  const invite = await prisma.householdInvite.findUnique({
    where: { token },
    include: { household: true },
  });

  if (!invite) {
    return { success: false, error: "Invalid invite link" };
  }

  if (invite.expiresAt < new Date()) {
    return { success: false, error: "This invite has expired" };
  }

  // Check if user is already in a household
  const existingMembership = await prisma.householdMember.findFirst({
    where: { userId: user.id },
  });

  if (existingMembership) {
    return { success: false, error: "You're already in a household" };
  }

  try {
    await prisma.$transaction([
      prisma.householdMember.create({
        data: {
          householdId: invite.householdId,
          userId: user.id,
          role: "MEMBER",
        },
      }),
      prisma.householdInvite.delete({
        where: { id: invite.id },
      }),
    ]);

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true, householdId: invite.householdId };
  } catch (error) {
    console.error("Accept invite error:", error);
    return { success: false, error: "Failed to join household" };
  }
}

export async function createInviteLink(): Promise<{ success: boolean; error?: string; token?: string }> {
  const user = await requireAuth();

  if (user.plan !== "PRO") {
    return { success: false, error: "Household sharing is a Pro feature" };
  }

  const membership = await prisma.householdMember.findFirst({
    where: { userId: user.id, role: "OWNER" },
  });

  if (!membership) {
    return { success: false, error: "You must be a household owner to create invite links" };
  }

  try {
    // Create an invite with a placeholder email (for link-based invites)
    const invite = await prisma.householdInvite.create({
      data: {
        householdId: membership.householdId,
        email: `link-invite-${Date.now()}@placeholder`,
        invitedBy: user.id,
        expiresAt: addDays(new Date(), 7),
      },
    });

    return { success: true, token: invite.token };
  } catch (error) {
    console.error("Create invite link error:", error);
    return { success: false, error: "Failed to create invite link" };
  }
}

export async function leaveHousehold(): Promise<HouseholdActionResult> {
  const user = await requireAuth();

  const membership = await prisma.householdMember.findFirst({
    where: { userId: user.id },
    include: { household: { include: { members: true } } },
  });

  if (!membership) {
    return { success: false, error: "You're not in a household" };
  }

  // If owner and only member, delete the household
  if (membership.role === "OWNER" && membership.household.members.length === 1) {
    try {
      await prisma.household.delete({
        where: { id: membership.householdId },
      });
      revalidatePath("/settings");
      revalidatePath("/dashboard");
      return { success: true };
    } catch (error) {
      console.error("Delete household error:", error);
      return { success: false, error: "Failed to delete household" };
    }
  }

  // If owner with other members, transfer ownership
  if (membership.role === "OWNER") {
    const nextOwner = membership.household.members.find(
      (m) => m.userId !== user.id
    );
    if (nextOwner) {
      try {
        await prisma.$transaction([
          prisma.householdMember.update({
            where: { id: nextOwner.id },
            data: { role: "OWNER" },
          }),
          prisma.householdMember.delete({
            where: { id: membership.id },
          }),
        ]);
        revalidatePath("/settings");
        revalidatePath("/dashboard");
        return { success: true };
      } catch (error) {
        console.error("Leave household error:", error);
        return { success: false, error: "Failed to leave household" };
      }
    }
  }

  // Regular member leaving
  try {
    await prisma.householdMember.delete({
      where: { id: membership.id },
    });
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Leave household error:", error);
    return { success: false, error: "Failed to leave household" };
  }
}

export async function cancelInvite(inviteId: string): Promise<HouseholdActionResult> {
  const user = await requireAuth();

  const membership = await prisma.householdMember.findFirst({
    where: { userId: user.id, role: "OWNER" },
  });

  if (!membership) {
    return { success: false, error: "You must be a household owner to cancel invites" };
  }

  try {
    await prisma.householdInvite.delete({
      where: { id: inviteId, householdId: membership.householdId },
    });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Cancel invite error:", error);
    return { success: false, error: "Failed to cancel invite" };
  }
}

export async function removeMember(memberId: string): Promise<HouseholdActionResult> {
  const user = await requireAuth();

  const membership = await prisma.householdMember.findFirst({
    where: { userId: user.id, role: "OWNER" },
  });

  if (!membership) {
    return { success: false, error: "You must be a household owner to remove members" };
  }

  const targetMember = await prisma.householdMember.findFirst({
    where: { id: memberId, householdId: membership.householdId },
  });

  if (!targetMember) {
    return { success: false, error: "Member not found" };
  }

  if (targetMember.userId === user.id) {
    return { success: false, error: "You cannot remove yourself" };
  }

  try {
    await prisma.householdMember.delete({
      where: { id: memberId },
    });
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Remove member error:", error);
    return { success: false, error: "Failed to remove member" };
  }
}

export async function getUserHousehold() {
  const user = await requireAuth();

  const membership = await prisma.householdMember.findFirst({
    where: { userId: user.id },
    include: {
      household: {
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          invites: true,
        },
      },
    },
  });

  if (!membership) {
    return null;
  }

  return {
    ...membership.household,
    userRole: membership.role,
  };
}

export async function getPendingInvites() {
  const user = await requireAuth();

  const invites = await prisma.householdInvite.findMany({
    where: {
      email: user.email.toLowerCase(),
      expiresAt: { gt: new Date() },
    },
    include: {
      household: {
        include: {
          members: {
            where: { role: "OWNER" },
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      },
    },
  });

  return invites;
}
