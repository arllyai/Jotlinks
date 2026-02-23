import "server-only";

import Stripe from "stripe";

const globalForStripe = globalThis as unknown as {
  __stripeClient?: Stripe;
};

export function getStripeClient() {
  if (globalForStripe.__stripeClient) {
    return globalForStripe.__stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  const client = new Stripe(secretKey);
  globalForStripe.__stripeClient = client;
  return client;
}

export function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_MONTHLY_PRICE_ID &&
      process.env.STRIPE_WEBHOOK_SECRET,
  );
}

export function getStripePricingConfig() {
  return {
    monthlyPriceId: process.env.STRIPE_MONTHLY_PRICE_ID,
    trialFeePriceId: process.env.STRIPE_TRIAL_FEE_PRICE_ID,
    trialDays: Number(process.env.STRIPE_TRIAL_DAYS ?? "7"),
    trialFeeCents: Number(process.env.STRIPE_TRIAL_FEE_CENTS ?? "199"),
    currency: (process.env.STRIPE_CURRENCY ?? "usd").toLowerCase(),
  };
}

export function unixToDate(unixTimestamp?: number | null) {
  if (!unixTimestamp) {
    return null;
  }

  return new Date(unixTimestamp * 1000);
}
