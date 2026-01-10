import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { InviteClient } from "./InviteClient";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const user = await requireAuth();
  const { token } = await params;

  const invite = await prisma.householdInvite.findUnique({
    where: { token },
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

  if (!invite) {
    redirect("/dashboard?error=invalid-invite");
  }

  if (invite.expiresAt < new Date()) {
    redirect("/dashboard?error=expired-invite");
  }

  // Check if user is already in a household
  const existingMembership = await prisma.householdMember.findFirst({
    where: { userId: user.id },
  });

  if (existingMembership) {
    redirect("/dashboard?error=already-in-household");
  }

  const ownerName =
    invite.household.members[0]?.user.name ||
    invite.household.members[0]?.user.email ||
    "Someone";

  return (
    <InviteClient
      token={token}
      householdName={invite.household.name}
      invitedBy={ownerName}
    />
  );
}
