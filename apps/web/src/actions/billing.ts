"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function createCheckoutSession(): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  const user = await requireAuth();

  if (!stripe || !process.env.STRIPE_PRO_PRICE_ID) {
    return {
      success: false,
      error: "Stripe is not configured. Use dev upgrade button in development.",
    };
  }

  try {
    // Get or create Stripe customer
    let customerId = (
      await prisma.user.findUnique({
        where: { id: user.id },
        select: { stripeCustomerId: true },
      })
    )?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.AUTH_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.AUTH_URL}/pricing`,
      metadata: { userId: user.id },
    });

    return { success: true, url: session.url! };
  } catch (error) {
    console.error("Checkout session error:", error);
    return { success: false, error: "Failed to create checkout session" };
  }
}

export async function createBillingPortalSession(): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  const user = await requireAuth();

  if (!stripe) {
    return { success: false, error: "Stripe is not configured" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });

  if (!dbUser?.stripeCustomerId) {
    return { success: false, error: "No billing account found" };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${process.env.AUTH_URL}/dashboard`,
    });

    return { success: true, url: session.url };
  } catch (error) {
    console.error("Billing portal error:", error);
    return { success: false, error: "Failed to create billing portal session" };
  }
}

// Dev-only: Manually upgrade to Pro
export async function devUpgradeToPro(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (process.env.NODE_ENV !== "development") {
    return { success: false, error: "Only available in development" };
  }

  const user = await requireAuth();

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { plan: "PRO" },
    });

    revalidatePath("/dashboard");
    revalidatePath("/pricing");
    return { success: true };
  } catch (error) {
    console.error("Dev upgrade error:", error);
    return { success: false, error: "Failed to upgrade" };
  }
}

// Dev-only: Downgrade to Free
export async function devDowngradeToFree(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (process.env.NODE_ENV !== "development") {
    return { success: false, error: "Only available in development" };
  }

  const user = await requireAuth();

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { plan: "FREE" },
    });

    revalidatePath("/dashboard");
    revalidatePath("/pricing");
    return { success: true };
  } catch (error) {
    console.error("Dev downgrade error:", error);
    return { success: false, error: "Failed to downgrade" };
  }
}
