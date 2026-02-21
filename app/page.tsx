import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-16 pb-16">
      <section className="ms-card overflow-hidden px-6 py-14 sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-md bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
            AI Resume Builder for Students
          </span>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Build Your Resume in Minutes with AI
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-[var(--muted)] sm:text-lg">
            Perfect for students, internships, and first jobs. Fill simple forms,
            let AI generate accomplishment bullets, and download a polished PDF.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="ms-btn-primary px-5 py-3 text-sm font-semibold"
            >
              Get Started
            </Link>
            <Link
              href="/templates"
              className="ms-btn-secondary px-5 py-3 text-sm font-semibold"
            >
              View Templates
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
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
              className="ms-card p-5"
            >
              <h3 className="text-lg font-semibold">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          Student-Friendly Templates
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Clean, minimal, and professional designs that help your experience stand out.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {["Classic", "Modern", "Minimal"].map((template) => (
            <div
              key={template}
              className="ms-card p-5"
            >
              <div className="h-36 rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-muted)]" />
              <p className="mt-3 text-sm font-medium">
                {template}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
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
              className="ms-card px-4 py-3 text-sm"
            >
              {feature}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
