const LOCAL_HOST_PATTERNS = ["localhost", "127.0.0.1", ".vercel.app"];

function hasAll(values: Array<string | undefined>) {
  return values.every((value) => Boolean(value && value.trim().length > 0));
}

export function getAppUrl() {
  const appUrl = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    "http://localhost:3000",
  ].find((value) => Boolean(value && value.trim().length > 0));

  return (appUrl ?? "http://localhost:3000").replace(/\/+$/, "");
}

export function isCustomDomainConfigured() {
  const appUrl = getAppUrl();

  try {
    const host = new URL(appUrl).host;
    return !LOCAL_HOST_PATTERNS.some((pattern) => host.includes(pattern));
  } catch {
    return false;
  }
}

export function getMetadataBase() {
  try {
    return new URL(getAppUrl());
  } catch {
    return new URL("http://localhost:3000");
  }
}

export function isFirebaseConfigured() {
  return hasAll([
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  ]);
}

export function isFirebaseAdminConfigured() {
  return hasAll([
    process.env.FIREBASE_PROJECT_ID,
    process.env.FIREBASE_CLIENT_EMAIL,
    process.env.FIREBASE_PRIVATE_KEY,
  ]);
}

export function isSupabaseConfigured() {
  return hasAll([
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ]);
}

export function isSupabaseServerConfigured() {
  return hasAll([
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ]);
}

export function isSupabaseDatabaseConfigured() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  return databaseUrl.includes("supabase");
}

export function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_MONTHLY_PRICE_ID &&
      process.env.STRIPE_WEBHOOK_SECRET,
  );
}

export function getAiProvider() {
  const configuredProvider = (process.env.AI_PROVIDER ?? "auto").toLowerCase();

  if (configuredProvider === "xai") {
    return process.env.XAI_API_KEY ? "xai" : "none";
  }

  if (configuredProvider === "openai") {
    return process.env.OPENAI_API_KEY ? "openai" : "none";
  }

  if (process.env.XAI_API_KEY) {
    return "xai";
  }

  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }

  return "none";
}

export function getIntegrationStatus() {
  const aiProvider = getAiProvider();

  return {
    appUrl: getAppUrl(),
    customDomainConfigured: isCustomDomainConfigured(),
    firebase: {
      clientConfigured: isFirebaseConfigured(),
      adminConfigured: isFirebaseAdminConfigured(),
    },
    supabase: {
      clientConfigured: isSupabaseConfigured(),
      serverConfigured: isSupabaseServerConfigured(),
      databaseConfigured: isSupabaseDatabaseConfigured(),
    },
    stripe: {
      configured: isStripeConfigured(),
      monthlyPriceConfigured: Boolean(process.env.STRIPE_MONTHLY_PRICE_ID),
      trialFeeConfigured: Boolean(process.env.STRIPE_TRIAL_FEE_PRICE_ID),
      webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      trialDays: Number(process.env.STRIPE_TRIAL_DAYS ?? "7"),
      trialFeeCents: Number(process.env.STRIPE_TRIAL_FEE_CENTS ?? "199"),
    },
    ai: {
      provider: aiProvider,
      xaiConfigured: Boolean(process.env.XAI_API_KEY),
      openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
      xaiModel: process.env.XAI_MODEL ?? "grok-2-1212",
      openaiModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    },
  };
}
