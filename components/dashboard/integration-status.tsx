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
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
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
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Integrations
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Firebase, Supabase, xAI, and domain connection health.
          </p>
        </div>
        <a
          href="/api/integrations/status"
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          View JSON status
        </a>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Firebase
            </h3>
            <StatusBadge
              ok={status.firebase.clientConfigured && status.firebase.adminConfigured}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
            Web SDK: {status.firebase.clientConfigured ? "configured" : "missing"}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            Admin SDK: {status.firebase.adminConfigured ? "configured" : "missing"}
          </p>
        </article>

        <article className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
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
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
            Client keys: {status.supabase.clientConfigured ? "configured" : "missing"}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            Service role key:{" "}
            {status.supabase.serverConfigured ? "configured" : "missing"}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            Prisma DB on Supabase:{" "}
            {status.supabase.databaseConfigured ? "yes" : "no"}
          </p>
        </article>

        <article className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              AI Provider
            </h3>
            <StatusBadge ok={status.ai.provider !== "none"} />
          </div>
          <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
            Active provider: {status.ai.provider}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            xAI: {status.ai.xaiConfigured ? status.ai.xaiModel : "not configured"}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            OpenAI fallback:{" "}
            {status.ai.openaiConfigured ? status.ai.openaiModel : "not configured"}
          </p>
        </article>

        <article className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/40">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Domain
            </h3>
            <StatusBadge ok={status.customDomainConfigured} />
          </div>
          <p className="mt-2 break-all text-xs text-zinc-600 dark:text-zinc-300">
            Base URL: {status.appUrl}
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-300">
            Set NEXT_PUBLIC_APP_URL to your production domain in Vercel.
          </p>
        </article>
      </div>
    </section>
  );
}
