import { NextResponse } from "next/server";

import { hasBillingAccessFromStatus } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { getClientIp, isSameOrigin } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";
import { getSessionUserId } from "@/lib/session";
import { getStripeClient, unixToDate } from "@/lib/stripe";

export const runtime = "nodejs";

function pickMostRelevantSubscription(
  subscriptions: Array<{
    status: string;
    created: number;
  }>,
) {
  const statusPriority = new Map<string, number>([
    ["active", 6],
    ["trialing", 5],
    ["past_due", 4],
    ["unpaid", 3],
    ["incomplete", 2],
    ["canceled", 1],
    ["incomplete_expired", 0],
  ]);

  return subscriptions.sort((a, b) => {
    const priorityA = statusPriority.get(a.status) ?? -1;
    const priorityB = statusPriority.get(b.status) ?? -1;

    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }

    return b.created - a.created;
  })[0];
}

function getSubscriptionCurrentPeriodEnd(subscription: {
  items: {
    data: Array<{
      current_period_end?: number | null;
    }>;
  };
}) {
  const periodEnds = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number" && value > 0);

  if (!periodEnds.length) {
    return null;
  }

  return unixToDate(Math.max(...periodEnds));
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Blocked request origin." }, { status: 403 });
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const limiter = rateLimit({
    key: `billing-refresh:${userId}:${ip}`,
    limit: 30,
    windowMs: 60_000,
  });

  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many billing status checks. Please wait and try again." },
      { status: 429 },
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured on the server." },
      { status: 500 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeCustomerId: true,
      stripeSubscriptionStatus: true,
      stripeTrialEndsAt: true,
      stripeCurrentPeriodEnd: true,
    },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({
      ok: true,
      hasAccess: false,
      status: user?.stripeSubscriptionStatus ?? "inactive",
      trialEndsAt: user?.stripeTrialEndsAt ?? null,
      currentPeriodEnd: user?.stripeCurrentPeriodEnd ?? null,
    });
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripeCustomerId,
    status: "all",
    limit: 20,
    expand: ["data.items"],
  });

  const selected = pickMostRelevantSubscription(
    subscriptions.data.map((subscription) => ({
      status: subscription.status,
      created: subscription.created ?? 0,
    })),
  );

  if (!selected) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeSubscriptionId: null,
        stripeSubscriptionStatus: "inactive",
        stripeTrialEndsAt: null,
        stripeCurrentPeriodEnd: null,
      },
    });

    return NextResponse.json({
      ok: true,
      hasAccess: false,
      status: "inactive",
      trialEndsAt: null,
      currentPeriodEnd: null,
    });
  }

  const chosenSubscription = subscriptions.data.find(
    (subscription) =>
      subscription.status === selected.status &&
      (subscription.created ?? 0) === selected.created,
  );

  if (!chosenSubscription) {
    return NextResponse.json(
      { error: "Unable to resolve active Stripe subscription state." },
      { status: 500 },
    );
  }

  const currentPeriodEnd = getSubscriptionCurrentPeriodEnd(chosenSubscription);
  const trialEndsAt = unixToDate(chosenSubscription.trial_end);

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: chosenSubscription.id,
      stripeSubscriptionStatus: chosenSubscription.status,
      stripeCurrentPeriodEnd: currentPeriodEnd,
      stripeTrialEndsAt: trialEndsAt,
    },
  });

  return NextResponse.json({
    ok: true,
    hasAccess: hasBillingAccessFromStatus(chosenSubscription.status),
    status: chosenSubscription.status,
    trialEndsAt,
    currentPeriodEnd,
  });
}
