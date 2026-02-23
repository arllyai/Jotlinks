import Link from "next/link";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Resume Templates
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Jotlinks includes student-friendly templates designed for internships,
          campus jobs, and first full-time roles.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="ms-card p-5">
          <h2 className="text-lg font-semibold">
            Classic
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Clean and minimal structure that works for most internship and entry-level
            applications.
          </p>
          <div className="mt-4 h-48 rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-muted)]" />
        </article>

        <article className="ms-card p-5">
          <h2 className="text-lg font-semibold">
            Modern
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            A polished design with subtle accent styling while staying ATS-friendly.
          </p>
          <div className="mt-4 h-48 rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-muted)]" />
        </article>
      </section>

      <Link
        href="/signup"
        className="ms-btn-primary inline-flex px-5 py-2.5 text-sm font-semibold"
      >
        Start Building
      </Link>
    </div>
  );
}
