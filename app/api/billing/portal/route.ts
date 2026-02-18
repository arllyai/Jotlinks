import { NextResponse } from "next/server";

import { getServerBaseUrl } from "@/lib/app-url";
import { prisma } from "@/lib/prisma";
import { isSameOrigin } from "@/lib/request";
import { getSessionUserId } from "@/lib/session";
import { getStripeClient } from "@/lib/stripe";

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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeCustomerId: true,
    },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer found for this account." },
      { status: 400 },
    );
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${getServerBaseUrl()}/dashboard`,
  });

  return NextResponse.json({
    ok: true,
    url: portalSession.url,
  });
}
