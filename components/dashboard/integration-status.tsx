type IntegrationStatus = {
  appUrl: string;
  customDomainConfigured: boolean;
  firebase: {
    clientConfigured: boolean;
    adminConfigured: boolean;
  };
  supabase: {
    clientConfigured: boolean;
    serverConfigured: boolean;
    databaseConfigured: boolean;
  };
  stripe: {
    configured: boolean;
    monthlyPriceConfigured: boolean;
    trialFeeConfigured: boolean;
    webhookConfigured: boolean;
    trialDays: number;
    trialFeeCents: number;
  };
  ai: {
    provider: string;
    xaiConfigured: boolean;
    openaiConfigured: boolean;
    xaiModel: string;
    openaiModel: string;
  };
};

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-[11px] font-medium ${
        ok
          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {ok ? "Connected" : "Needs setup"}
    </span>
  );
}

export function IntegrationStatus({
  status,
}: {
  status: IntegrationStatus;
}) {
  return (
    <section className="ms-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Integrations
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Firebase, Supabase, xAI, and domain connection health.
          </p>
        </div>
        <a
          href="/api/integrations/status"
          className="ms-btn-secondary px-3 py-1.5 text-xs font-medium"
        >
          View JSON status
        </a>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="ms-card-soft p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              Firebase
            </h3>
            <StatusBadge
              ok={status.firebase.clientConfigured && status.firebase.adminConfigured}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Web SDK: {status.firebase.clientConfigured ? "configured" : "missing"}
          </p>
          <p className="text-xs text-[var(--muted)]">
            Admin SDK: {status.firebase.adminConfigured ? "configured" : "missing"}
          </p>
        </article>

        <article className="ms-card-soft p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              Supabase
            </h3>
            <StatusBadge
              ok={
                status.supabase.clientConfigured &&
                status.supabase.serverConfigured &&
                status.supabase.databaseConfigured
              }
            />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Client keys: {status.supabase.clientConfigured ? "configured" : "missing"}
          </p>
          <p className="text-xs text-[var(--muted)]">
            Service role key:{" "}
            {status.supabase.serverConfigured ? "configured" : "missing"}
          </p>
          <p className="text-xs text-[var(--muted)]">
            Prisma DB on Supabase:{" "}
            {status.supabase.databaseConfigured ? "yes" : "no"}
          </p>
        </article>

        <article className="ms-card-soft p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              AI Provider
            </h3>
            <StatusBadge ok={status.ai.provider !== "none"} />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Active provider: {status.ai.provider}
          </p>
          <p className="text-xs text-[var(--muted)]">
            xAI: {status.ai.xaiConfigured ? status.ai.xaiModel : "not configured"}
          </p>
          <p className="text-xs text-[var(--muted)]">
            OpenAI fallback:{" "}
            {status.ai.openaiConfigured ? status.ai.openaiModel : "not configured"}
          </p>
        </article>

        <article className="ms-card-soft p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              Stripe Billing
            </h3>
            <StatusBadge ok={status.stripe.configured} />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Monthly price ID:{" "}
            {status.stripe.monthlyPriceConfigured ? "configured" : "missing"}
          </p>
          <p className="text-xs text-[var(--muted)]">
            Trial fee config:{" "}
            {status.stripe.trialFeeConfigured
              ? "price ID configured"
              : `$${(status.stripe.trialFeeCents / 100).toFixed(2)} fallback amount`}
          </p>
          <p className="text-xs text-[var(--muted)]">
            Trial length: {status.stripe.trialDays} days
          </p>
          <p className="text-xs text-[var(--muted)]">
            Webhook secret:{" "}
            {status.stripe.webhookConfigured ? "configured" : "missing"}
          </p>
        </article>

        <article className="ms-card-soft p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              Domain
            </h3>
            <StatusBadge ok={status.customDomainConfigured} />
          </div>
          <p className="mt-2 break-all text-xs text-[var(--muted)]">
            Base URL: {status.appUrl}
          </p>
          <p className="text-xs text-[var(--muted)]">
            Set NEXT_PUBLIC_APP_URL to your production domain in Vercel.
          </p>
        </article>
      </div>
    </section>
  );
}
