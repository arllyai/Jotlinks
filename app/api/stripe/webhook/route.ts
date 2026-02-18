import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getStripeClient, unixToDate } from "@/lib/stripe";

function getCustomerIdFromValue(
  value: string | Stripe.Customer | Stripe.DeletedCustomer | null,
) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return value.id ?? null;
}

function getMetadataUserId(
  metadata: Record<string, string> | null | undefined,
) {
  const userId = metadata?.userId;
  return userId && userId.trim().length > 0 ? userId : null;
}

async function resolveUserId({
  metadataUserId,
  customerId,
}: {
  metadataUserId: string | null;
  customerId: string | null;
}) {
  if (metadataUserId) {
    const user = await prisma.user.findUnique({
      where: { id: metadataUserId },
      select: { id: true },
    });

    if (user) {
      return user.id;
    }
  }

  if (!customerId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  return user?.id ?? null;
}

function getSubscriptionCurrentPeriodEnd(subscription: Stripe.Subscription) {
  const periodEnds = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number" && value > 0);

  if (!periodEnds.length) {
    return null;
  }

  return unixToDate(Math.max(...periodEnds));
}

async function syncUserFromSubscription(
  subscription: Stripe.Subscription,
  metadataUserId?: string | null,
) {
  const customerId = getCustomerIdFromValue(subscription.customer);
  const userId = await resolveUserId({
    metadataUserId: metadataUserId ?? getMetadataUserId(subscription.metadata),
    customerId,
  });

  if (!userId) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId ?? undefined,
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
      stripeCurrentPeriodEnd: getSubscriptionCurrentPeriodEnd(subscription),
      stripeTrialEndsAt: unixToDate(subscription.trial_end),
    },
  });
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = getCustomerIdFromValue(session.customer);
      const metadataUserId = getMetadataUserId(session.metadata);

      if (session.mode === "subscription" && session.subscription) {
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncUserFromSubscription(subscription, metadataUserId);
      } else {
        const userId = await resolveUserId({ metadataUserId, customerId });
        if (userId && customerId) {
          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId },
          });
        }
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncUserFromSubscription(subscription);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = getCustomerIdFromValue(invoice.customer);

      if (!customerId) {
        break;
      }

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          stripeSubscriptionStatus: "past_due",
        },
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
