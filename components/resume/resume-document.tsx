import clsx from "clsx";

import type { ResumeData, ResumeTemplate, SectionKey } from "@/lib/resume-types";

const sectionLabels: Record<SectionKey, string> = {
  education: "Education",
  experience: "Work Experience",
  projects: "Projects",
  skills: "Skills",
  activities: "Activities",
};

function SectionHeading({
  title,
  template,
}: {
  title: string;
  template: ResumeTemplate;
}) {
  return (
    <div className="mb-2 mt-4">
      <h3
        className={clsx(
          "text-xs font-semibold uppercase tracking-[0.16em]",
          template === "modern"
            ? "text-sky-700 dark:text-sky-400"
            : "text-zinc-700 dark:text-zinc-300",
        )}
      >
        {title}
      </h3>
      <div className="mt-1 h-px w-full bg-zinc-200 dark:bg-zinc-700" />
    </div>
  );
}

function DateRange({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  const value = [startDate, endDate].filter(Boolean).join(" - ");
  if (!value) {
    return null;
  }

  return <p className="text-xs text-zinc-500 dark:text-zinc-400">{value}</p>;
}

export function ResumeDocument({
  data,
  template,
}: {
  data: ResumeData;
  template: ResumeTemplate;
}) {
  return (
    <article
      className={clsx(
        "mx-auto w-full max-w-3xl rounded-2xl border bg-white p-8 shadow-sm dark:bg-zinc-900",
        template === "modern"
          ? "border-sky-100 dark:border-sky-900/50"
          : "border-zinc-200 dark:border-zinc-700",
      )}
    >
      <header className="space-y-2">
        <h1
          className={clsx(
            "text-3xl font-bold",
            template === "modern"
              ? "text-sky-800 dark:text-sky-300"
              : "text-zinc-900 dark:text-zinc-50",
          )}
        >
          {data.personalInfo.name || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-zinc-600 dark:text-zinc-300">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
          {data.personalInfo.linkedIn && <span>{data.personalInfo.linkedIn}</span>}
        </div>
      </header>

      {data.summary && (
        <section className="mt-6">
          <SectionHeading title="Summary" template={template} />
          <p className="whitespace-pre-line text-sm leading-6 text-zinc-700 dark:text-zinc-200">
            {data.summary}
          </p>
        </section>
      )}

      {data.sectionOrder.map((section) => {
        if (section === "education" && data.education.length > 0) {
          return (
            <section key={section}>
              <SectionHeading title={sectionLabels[section]} template={template} />
              <div className="space-y-4">
                {data.education.map((entry) => (
                  <div key={entry.id}>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {[entry.school, entry.degree].filter(Boolean).join(" — ")}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      {[entry.fieldOfStudy, entry.gpa && `GPA: ${entry.gpa}`]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                    <DateRange startDate={entry.startDate} endDate={entry.endDate} />
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (section === "experience" && data.experience.length > 0) {
          return (
            <section key={section}>
              <SectionHeading title={sectionLabels[section]} template={template} />
              <div className="space-y-4">
                {data.experience.map((entry) => (
                  <div key={entry.id}>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {[entry.role, entry.company].filter(Boolean).join(" — ")}
                    </h4>
                    <DateRange startDate={entry.startDate} endDate={entry.endDate} />
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-200">
                      {(entry.bullets.length ? entry.bullets : [entry.description])
                        .filter(Boolean)
                        .map((bullet, index) => (
                          <li key={`${entry.id}-bullet-${index}`}>{bullet}</li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (section === "projects" && data.projects.length > 0) {
          return (
            <section key={section}>
              <SectionHeading title={sectionLabels[section]} template={template} />
              <div className="space-y-4">
                {data.projects.map((entry) => (
                  <div key={entry.id}>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {[entry.name, entry.organization].filter(Boolean).join(" — ")}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {[entry.startDate, entry.endDate].filter(Boolean).join(" - ")}
                      {entry.link ? ` • ${entry.link}` : ""}
                    </p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-200">
                      {(entry.bullets.length ? entry.bullets : [entry.description])
                        .filter(Boolean)
                        .map((bullet, index) => (
                          <li key={`${entry.id}-project-bullet-${index}`}>{bullet}</li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (section === "skills" && data.skills.length > 0) {
          return (
            <section key={section}>
              <SectionHeading title={sectionLabels[section]} template={template} />
              <p className="text-sm text-zinc-700 dark:text-zinc-200">
                {data.skills.join(" • ")}
              </p>
            </section>
          );
        }

        if (section === "activities" && data.activities.length > 0) {
          return (
            <section key={section}>
              <SectionHeading title={sectionLabels[section]} template={template} />
              <div className="space-y-4">
                {data.activities.map((entry) => (
                  <div key={entry.id}>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {[entry.name, entry.role].filter(Boolean).join(" — ")}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {[entry.organization, entry.startDate && entry.endDate
                        ? `${entry.startDate} - ${entry.endDate}`
                        : entry.startDate || entry.endDate]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                    {entry.description && (
                      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                        {entry.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        return null;
      })}
    </article>
  );
}
