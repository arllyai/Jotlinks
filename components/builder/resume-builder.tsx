"use client";

import Link from "next/link";
import {
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  createEmptyActivity,
  createEmptyEducation,
  createEmptyExperience,
  createEmptyProject,
} from "@/lib/default-resume";
import type {
  ActivityItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeData,
  ResumeTemplate,
  SectionKey,
} from "@/lib/resume-types";
import { ResumeDocument } from "@/components/resume/resume-document";

type BuilderResume = {
  id: string;
  title: string;
  template: ResumeTemplate;
  isPublic: boolean;
  slug: string;
  data: ResumeData;
};

function FormLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
      {children}
    </span>
  );
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-500 dark:border-zinc-700 dark:bg-zinc-950"
    />
  );
}

function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-500 dark:border-zinc-700 dark:bg-zinc-950"
    />
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function SectionOrderControls({
  order,
  onMove,
}: {
  order: SectionKey[];
  onMove: (index: number, direction: "up" | "down") => void;
}) {
  return (
    <SectionCard title="Section Order">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Reorder sections to control how your resume is presented.
      </p>
      <div className="space-y-2">
        {order.map((section, index) => (
          <div
            key={section}
            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/50"
          >
            <span className="text-sm font-medium capitalize text-zinc-800 dark:text-zinc-100">
              {section}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onMove(index, "up")}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:opacity-40 dark:border-zinc-600"
              >
                Up
              </button>
              <button
                type="button"
                disabled={index === order.length - 1}
                onClick={() => onMove(index, "down")}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:opacity-40 dark:border-zinc-600"
              >
                Down
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function ResumeBuilder({ initialResume }: { initialResume: BuilderResume }) {
  const [title, setTitle] = useState(initialResume.title);
  const [template, setTemplate] = useState<ResumeTemplate>(initialResume.template);
  const [isPublic, setIsPublic] = useState(initialResume.isPublic);
  const [data, setData] = useState<ResumeData>(initialResume.data);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [statusMessage, setStatusMessage] = useState("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const publicUrl = useMemo(() => `/r/${initialResume.slug}`, [initialResume.slug]);

  const markDirty = () => {
    setDirty(true);
    setSaveState("saved");
  };

  const saveResume = useCallback(async () => {
    setSaveState("saving");
    const response = await fetch(`/api/resumes/${initialResume.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        template,
        isPublic,
        data,
      }),
    });

    if (!response.ok) {
      setSaveState("error");
      setStatusMessage("Autosave failed. Keep editing and we will retry.");
      return;
    }

    setDirty(false);
    setSaveState("saved");
    setStatusMessage("All changes saved.");
  }, [data, initialResume.id, isPublic, template, title]);

  useEffect(() => {
    if (!dirty) {
      return;
    }

    const timer = setTimeout(() => {
      void saveResume();
    }, 3500);

    return () => clearTimeout(timer);
  }, [dirty, saveResume]);

  const moveSection = (index: number, direction: "up" | "down") => {
    setData((previous) => {
      const nextOrder = [...previous.sectionOrder];
      const swapWith = direction === "up" ? index - 1 : index + 1;

      if (swapWith < 0 || swapWith >= nextOrder.length) {
        return previous;
      }

      [nextOrder[index], nextOrder[swapWith]] = [nextOrder[swapWith], nextOrder[index]];
      return {
        ...previous,
        sectionOrder: nextOrder,
      };
    });
    markDirty();
  };

  const updateExperience = (
    id: string,
    update: Partial<ExperienceItem> | ((entry: ExperienceItem) => ExperienceItem),
  ) => {
    setData((previous) => ({
      ...previous,
      experience: previous.experience.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }

        if (typeof update === "function") {
          return update(entry);
        }

        return {
          ...entry,
          ...update,
        };
      }),
    }));
    markDirty();
  };

  const updateEducation = (
    id: string,
    update: Partial<EducationItem> | ((entry: EducationItem) => EducationItem),
  ) => {
    setData((previous) => ({
      ...previous,
      education: previous.education.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }

        if (typeof update === "function") {
          return update(entry);
        }

        return {
          ...entry,
          ...update,
        };
      }),
    }));
    markDirty();
  };

  const updateProject = (
    id: string,
    update: Partial<ProjectItem> | ((entry: ProjectItem) => ProjectItem),
  ) => {
    setData((previous) => ({
      ...previous,
      projects: previous.projects.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }

        if (typeof update === "function") {
          return update(entry);
        }

        return {
          ...entry,
          ...update,
        };
      }),
    }));
    markDirty();
  };

  const updateActivity = (
    id: string,
    update: Partial<ActivityItem> | ((entry: ActivityItem) => ActivityItem),
  ) => {
    setData((previous) => ({
      ...previous,
      activities: previous.activities.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }

        if (typeof update === "function") {
          return update(entry);
        }

        return {
          ...entry,
          ...update,
        };
      }),
    }));
    markDirty();
  };

  const generateBullets = (
    kind: "experience" | "project",
    payload: { id: string; role: string; organization: string; description: string },
  ) => {
    setGeneratingId(payload.id);
    setStatusMessage("");

    startTransition(async () => {
      const response = await fetch("/api/generate-bullets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: payload.role,
          organization: payload.organization,
          description: payload.description,
        }),
      });

      if (!response.ok) {
        setStatusMessage("Could not generate bullets for this entry.");
        setGeneratingId(null);
        return;
      }

      const result = (await response.json()) as { bullets: string[] };

      if (kind === "experience") {
        updateExperience(payload.id, { bullets: result.bullets });
      } else {
        updateProject(payload.id, { bullets: result.bullets });
      }

      setStatusMessage("AI bullets generated.");
      setGeneratingId(null);
    });
  };

  const downloadPdf = async () => {
    const response = await fetch(`/api/resumes/${initialResume.id}/pdf`);

    if (!response.ok) {
      setStatusMessage("Unable to export PDF right now.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "resume"}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyPublicLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}${publicUrl}`);
    setStatusMessage("Public link copied to clipboard.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard"
            className="text-xs font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
          >
            ← Back to dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Resume Builder
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Changes save automatically every few seconds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsPublic((value) => !value);
              markDirty();
            }}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
          >
            {isPublic ? "Public Link On" : "Make Public"}
          </button>
          {isPublic && (
            <button
              type="button"
              onClick={copyPublicLink}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
            >
              Copy Public Link
            </button>
          )}
          <button
            type="button"
            onClick={downloadPdf}
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-500"
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span
          className={`rounded-full px-2 py-1 ${
            saveState === "saving"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
              : saveState === "error"
                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
          }`}
        >
          {saveState === "saving"
            ? "Saving..."
            : saveState === "error"
              ? "Save failed"
              : "Saved"}
        </span>
        {statusMessage && (
          <span className="text-zinc-600 dark:text-zinc-300">{statusMessage}</span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <SectionCard title="Resume Basics">
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <FormLabel>Title</FormLabel>
                <TextInput
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    markDirty();
                  }}
                />
              </label>

              <label>
                <FormLabel>Template</FormLabel>
                <select
                  value={template}
                  onChange={(event) => {
                    setTemplate(event.target.value as ResumeTemplate);
                    markDirty();
                  }}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-500 dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                </select>
              </label>
            </div>
          </SectionCard>

          <SectionCard title="Personal Information">
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <FormLabel>Full name</FormLabel>
                <TextInput
                  value={data.personalInfo.name}
                  onChange={(event) => {
                    setData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, name: event.target.value },
                    }));
                    markDirty();
                  }}
                />
              </label>
              <label>
                <FormLabel>Email</FormLabel>
                <TextInput
                  type="email"
                  value={data.personalInfo.email}
                  onChange={(event) => {
                    setData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, email: event.target.value },
                    }));
                    markDirty();
                  }}
                />
              </label>
              <label>
                <FormLabel>Phone</FormLabel>
                <TextInput
                  value={data.personalInfo.phone}
                  onChange={(event) => {
                    setData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, phone: event.target.value },
                    }));
                    markDirty();
                  }}
                />
              </label>
              <label>
                <FormLabel>Location</FormLabel>
                <TextInput
                  value={data.personalInfo.location}
                  onChange={(event) => {
                    setData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, location: event.target.value },
                    }));
                    markDirty();
                  }}
                />
              </label>
              <label>
                <FormLabel>Website</FormLabel>
                <TextInput
                  value={data.personalInfo.website}
                  onChange={(event) => {
                    setData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, website: event.target.value },
                    }));
                    markDirty();
                  }}
                />
              </label>
              <label>
                <FormLabel>LinkedIn</FormLabel>
                <TextInput
                  value={data.personalInfo.linkedIn}
                  onChange={(event) => {
                    setData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, linkedIn: event.target.value },
                    }));
                    markDirty();
                  }}
                />
              </label>
            </div>
          </SectionCard>

          <SectionCard title="Professional Summary">
            <TextArea
              rows={5}
              value={data.summary}
              onChange={(event) => {
                setData((prev) => ({
                  ...prev,
                  summary: event.target.value,
                }));
                markDirty();
              }}
              placeholder="Write 2-4 lines about your goals and strengths..."
            />
          </SectionCard>

          <SectionCard title="Education">
            <button
              type="button"
              onClick={() => {
                setData((prev) => ({
                  ...prev,
                  education: [...prev.education, createEmptyEducation()],
                }));
                markDirty();
              }}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
            >
              + Add Education
            </button>

            <div className="space-y-4">
              {data.education.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/30"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                      Education Entry
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          education: prev.education.filter((item) => item.id !== entry.id),
                        }));
                        markDirty();
                      }}
                      className="text-xs text-rose-600 dark:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <TextInput
                      placeholder="School"
                      value={entry.school}
                      onChange={(event) =>
                        updateEducation(entry.id, { school: event.target.value })
                      }
                    />
                    <TextInput
                      placeholder="Degree"
                      value={entry.degree}
                      onChange={(event) =>
                        updateEducation(entry.id, { degree: event.target.value })
                      }
                    />
                    <TextInput
                      placeholder="Field of study"
                      value={entry.fieldOfStudy}
                      onChange={(event) =>
                        updateEducation(entry.id, { fieldOfStudy: event.target.value })
                      }
                    />
                    <TextInput
                      placeholder="GPA (optional)"
                      value={entry.gpa}
                      onChange={(event) =>
                        updateEducation(entry.id, { gpa: event.target.value })
                      }
                    />
                    <TextInput
                      placeholder="Start date"
                      value={entry.startDate}
                      onChange={(event) =>
                        updateEducation(entry.id, { startDate: event.target.value })
                      }
                    />
                    <TextInput
                      placeholder="End date"
                      value={entry.endDate}
                      onChange={(event) =>
                        updateEducation(entry.id, { endDate: event.target.value })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Work Experience">
            <button
              type="button"
              onClick={() => {
                setData((prev) => ({
                  ...prev,
                  experience: [...prev.experience, createEmptyExperience()],
                }));
                markDirty();
              }}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
            >
              + Add Experience
            </button>

            <div className="space-y-4">
              {data.experience.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/30"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                      Experience Entry
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          experience: prev.experience.filter((item) => item.id !== entry.id),
                        }));
                        markDirty();
                      }}
                      className="text-xs text-rose-600 dark:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <TextInput
                      placeholder="Role (e.g. Barista)"
                      value={entry.role}
                      onChange={(event) =>
                        updateExperience(entry.id, { role: event.target.value })
                      }
                    />
                    <TextInput
                      placeholder="Company / Organization"
                      value={entry.company}
                      onChange={(event) =>
                        updateExperience(entry.id, { company: event.target.value })
                      }
                    />
                    <TextInput
                      placeholder="Start date"
                      value={entry.startDate}
                      onChange={(event) =>
                        updateExperience(entry.id, { startDate: event.target.value })
                      }
                    />
                    <TextInput
                      placeholder="End date"
                      value={entry.endDate}
                      onChange={(event) =>
                        updateExperience(entry.id, { endDate: event.target.value })
                      }
                    />
                  </div>

                  <div className="mt-2">
                    <FormLabel>What you did</FormLabel>
                    <TextArea
                      rows={3}
                      placeholder="Made drinks and served customers..."
                      value={entry.description}
                      onChange={(event) =>
                        updateExperience(entry.id, { description: event.target.value })
                      }
                    />
                  </div>

                  <div className="mt-2">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <FormLabel>Bullets (one per line)</FormLabel>
                      <button
                        type="button"
                        disabled={
                          isPending ||
                          generatingId === entry.id ||
                          !entry.role ||
                          !entry.company ||
                          !entry.description
                        }
                        onClick={() =>
                          generateBullets("experience", {
                            id: entry.id,
                            role: entry.role,
                            organization: entry.company,
                            description: entry.description,
                          })
                        }
                        className="rounded-md bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                      >
                        {generatingId === entry.id
                          ? "Generating..."
                          : "Generate with AI"}
                      </button>
                    </div>
                    <TextArea
                      rows={4}
                      value={entry.bullets.join("\n")}
                      onChange={(event) =>
                        updateExperience(entry.id, {
                          bullets: event.target.value
                            .split("\n")
                            .map((line) => line.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Projects">
            <button
              type="button"
              onClick={() => {
                setData((prev) => ({
                  ...prev,
                  projects: [...prev.projects, createEmptyProject()],
                }));
                markDirty();
              }}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
            >
              + Add Project
            </button>

            <div className="space-y-4">
              {data.projects.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/30"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                      Project Entry
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          projects: prev.projects.filter((item) => item.id !== entry.id),
                        }));
                        markDirty();
                      }}
                      className="text-xs text-rose-600 dark:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <TextInput
                      placeholder="Project name"
                      value={entry.name}
                      onChange={(event) =>
                        updateProject(entry.id, { name: event.target.value })
                      }
                    />
                    <TextInput
                      placeholder="Organization (optional)"
                      value={entry.organization}
                      onChange={(event) =>
                        updateProject(entry.id, { organization: event.target.value })
                      }
                    />
                    <TextInput
                      placeholder="Start date"
                      value={entry.startDate}
                      onChange={(event) =>
                        updateProject(entry.id, { startDate: event.target.value })
                      }
                    />
                    <TextInput
                      placeholder="End date"
                      value={entry.endDate}
                      onChange={(event) =>
                        updateProject(entry.id, { endDate: event.target.value })
                      }
                    />
                    <div className="sm:col-span-2">
                      <TextInput
                        placeholder="Project link (optional)"
                        value={entry.link}
                        onChange={(event) =>
                          updateProject(entry.id, { link: event.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <FormLabel>What you built / did</FormLabel>
                    <TextArea
                      rows={3}
                      placeholder="Describe your contribution..."
                      value={entry.description}
                      onChange={(event) =>
                        updateProject(entry.id, { description: event.target.value })
                      }
                    />
                  </div>

                  <div className="mt-2">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <FormLabel>Bullets (one per line)</FormLabel>
                      <button
                        type="button"
                        disabled={
                          isPending ||
                          generatingId === entry.id ||
                          !entry.name ||
                          !entry.organization ||
                          !entry.description
                        }
                        onClick={() =>
                          generateBullets("project", {
                            id: entry.id,
                            role: entry.name,
                            organization: entry.organization || "Project Team",
                            description: entry.description,
                          })
                        }
                        className="rounded-md bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                      >
                        {generatingId === entry.id
                          ? "Generating..."
                          : "Generate with AI"}
                      </button>
                    </div>
                    <TextArea
                      rows={4}
                      value={entry.bullets.join("\n")}
                      onChange={(event) =>
                        updateProject(entry.id, {
                          bullets: event.target.value
                            .split("\n")
                            .map((line) => line.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Skills">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Add comma-separated skills (e.g. React, Python, Public Speaking).
            </p>
            <TextArea
              rows={3}
              value={data.skills.join(", ")}
              onChange={(event) => {
                setData((prev) => ({
                  ...prev,
                  skills: event.target.value
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean),
                }));
                markDirty();
              }}
            />
          </SectionCard>

          <SectionCard title="Activities / Clubs / Volunteering">
            <button
              type="button"
              onClick={() => {
                setData((prev) => ({
                  ...prev,
                  activities: [...prev.activities, createEmptyActivity()],
                }));
                markDirty();
              }}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
            >
              + Add Activity
            </button>

            <div className="space-y-4">
              {data.activities.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/30"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                      Activity Entry
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          activities: prev.activities.filter((item) => item.id !== entry.id),
                        }));
                        markDirty();
                      }}
                      className="text-xs text-rose-600 dark:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <TextInput
                      placeholder="Activity name"
                      value={entry.name}
                      onChange={(event) =>
                        updateActivity(entry.id, { name: event.target.value })
                      }
                    />
                    <TextInput
                      placeholder="Role"
                      value={entry.role}
                      onChange={(event) =>
                        updateActivity(entry.id, { role: event.target.value })
                      }
                    />
                    <TextInput
                      placeholder="Organization"
                      value={entry.organization}
                      onChange={(event) =>
                        updateActivity(entry.id, { organization: event.target.value })
                      }
                    />
                    <TextInput
                      placeholder="Start date"
                      value={entry.startDate}
                      onChange={(event) =>
                        updateActivity(entry.id, { startDate: event.target.value })
                      }
                    />
                    <TextInput
                      placeholder="End date"
                      value={entry.endDate}
                      onChange={(event) =>
                        updateActivity(entry.id, { endDate: event.target.value })
                      }
                    />
                  </div>
                  <div className="mt-2">
                    <FormLabel>Description</FormLabel>
                    <TextArea
                      rows={3}
                      value={entry.description}
                      onChange={(event) =>
                        updateActivity(entry.id, { description: event.target.value })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionOrderControls order={data.sectionOrder} onMove={moveSection} />
        </div>

        <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-auto">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
            Live Preview
          </h2>
          <ResumeDocument data={data} template={template} />
        </div>
      </div>
    </div>
  );
}
