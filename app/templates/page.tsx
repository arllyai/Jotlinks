import Link from "next/link";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Resume Templates
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Jotlinks includes student-friendly templates designed for internships,
          campus jobs, and first full-time roles.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Classic
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Clean and minimal structure that works for most internship and entry-level
            applications.
          </p>
          <div className="mt-4 h-48 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800" />
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Modern
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            A polished design with subtle accent styling while staying ATS-friendly.
          </p>
          <div className="mt-4 h-48 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800" />
        </article>
      </section>

      <Link
        href="/signup"
        className="inline-flex rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500"
      >
        Start Building
      </Link>
    </div>
  );
}
