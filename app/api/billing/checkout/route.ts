import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getServerBaseUrl } from "@/lib/app-url";
import { getUserBillingState } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { isSameOrigin } from "@/lib/request";
import { isResumeReadyForCheckout } from "@/lib/resume-completion";
import { getSessionUserId } from "@/lib/session";
import { getStripeClient, getStripePricingConfig } from "@/lib/stripe";
import { resumeDataSchema } from "@/lib/validation";

function sanitizeResumeId(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 64) : "";
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Blocked request origin." }, { status: 403 });
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured on the server." },
      { status: 500 },
    );
  }

  const pricing = getStripePricingConfig();
  if (!pricing.monthlyPriceId) {
    return NextResponse.json(
      { error: "Monthly Stripe price is not configured." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const resumeId = sanitizeResumeId((body as Record<string, unknown>)?.resumeId);
  if (!resumeId) {
    return NextResponse.json({ error: "Resume ID is required." }, { status: 400 });
  }

  const billingState = await getUserBillingState(userId);
  if (billingState.hasAccess) {
    return NextResponse.json({
      ok: true,
      alreadyActive: true,
      redirectUrl: `${getServerBaseUrl()}/dashboard/resumes/${resumeId}?billing=active`,
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      stripeCustomerId: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId,
    },
    select: {
      id: true,
      data: true,
    },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const resumeValidation = resumeDataSchema.safeParse(resume.data);
  if (!resumeValidation.success) {
    return NextResponse.json(
      { error: "Resume data is invalid. Please continue editing and try again." },
      { status: 400 },
    );
  }

  if (!isResumeReadyForCheckout(resumeValidation.data)) {
    return NextResponse.json(
      {
        error:
          "Complete key resume fields first (name, email, and at least one core section) before starting payment.",
      },
      { status: 400 },
    );
  }

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: {
        userId,
      },
    });
    customerId = customer.id;

    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: customerId,
      },
    });
  }

  const baseUrl = getServerBaseUrl();
  const successUrl = `${baseUrl}/dashboard/resumes/${resumeId}?billing=success`;
  const cancelUrl = `${baseUrl}/dashboard/resumes/${resumeId}?billing=cancel`;

  const addInvoiceItem: Stripe.Checkout.SessionCreateParams.SubscriptionData.AddInvoiceItem =
    pricing.trialFeePriceId
      ? {
          price: pricing.trialFeePriceId,
          quantity: 1,
        }
      : {
          price_data: {
            currency: pricing.currency,
            unit_amount: pricing.trialFeeCents,
            product_data: {
              name: `Jotlinks ${pricing.trialDays}-day trial`,
            },
          },
          quantity: 1,
        };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    payment_method_collection: "always",
    line_items: [
      {
        price: pricing.monthlyPriceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      resumeId,
    },
    subscription_data: {
      trial_period_days: pricing.trialDays,
      metadata: {
        userId,
        resumeId,
      },
      add_invoice_items: [addInvoiceItem],
    },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Could not create Stripe checkout session." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    url: session.url,
  });
}
