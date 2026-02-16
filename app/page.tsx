import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-16 pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-b from-sky-50 to-white px-6 py-14 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950 sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
            AI Resume Builder for Students
          </span>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Build Your Resume in Minutes with AI
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-zinc-600 dark:text-zinc-300 sm:text-lg">
            Perfect for students, internships, and first jobs. Fill simple forms,
            let AI generate accomplishment bullets, and download a polished PDF.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              Get Started
            </Link>
            <Link
              href="/templates"
              className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              View Templates
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          How It Works
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "1. Fill simple forms",
              body: "Add your education, work, projects, skills, and activities in an easy step-by-step builder.",
            },
            {
              title: "2. Let AI write accomplishments",
              body: "Describe what you did in plain language, then generate polished resume bullets in one click.",
            },
            {
              title: "3. Download your resume",
              body: "Preview your resume live, choose a clean template, and export a PDF ready for applications.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Student-Friendly Templates
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Clean, minimal, and professional designs that help your experience stand out.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {["Classic", "Modern", "Minimal"].map((template) => (
            <div
              key={template}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="h-36 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800" />
              <p className="mt-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {template}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Key Features
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            "AI accomplishment bullet generator",
            "Simple form-based editing",
            "Free student-focused templates",
            "Live side-by-side preview",
            "PDF export and public sharing links",
            "Autosave with no manual save required",
          ].map((feature) => (
            <div
              key={feature}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              {feature}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
