import "server-only";

import { prisma } from "@/lib/prisma";

const BILLING_ACCESS_STATUSES = new Set(["active", "trialing"]);

export function hasBillingAccessFromStatus(status: string | null | undefined) {
  if (!status) {
    return false;
  }

  return BILLING_ACCESS_STATUSES.has(status.toLowerCase());
}

export async function getUserBillingState(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeSubscriptionStatus: true,
      stripeTrialEndsAt: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
    },
  });

  const status = user?.stripeSubscriptionStatus ?? "inactive";
  const hasAccess = hasBillingAccessFromStatus(status);

  return {
    hasAccess,
    status,
    stripeCustomerId: user?.stripeCustomerId ?? null,
    trialEndsAt: user?.stripeTrialEndsAt ?? null,
    currentPeriodEnd: user?.stripeCurrentPeriodEnd ?? null,
  };
}

export async function userHasBillingAccess(userId: string) {
  const state = await getUserBillingState(userId);
  return state.hasAccess;
}
