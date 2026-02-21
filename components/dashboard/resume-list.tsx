"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { getClientBaseUrl } from "@/lib/app-url";

type ResumeListItem = {
  id: string;
  title: string;
  template: string;
  isPublic: boolean;
  slug: string;
  updatedAt: string;
  createdAt: string;
};

export function ResumeList({ initialResumes }: { initialResumes: ResumeListItem[] }) {
  const router = useRouter();
  const [resumes, setResumes] = useState(initialResumes);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }),
    [],
  );

  const createResume = () => {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Untitled Resume",
          template: "classic",
        }),
      });

      if (!response.ok) {
        setMessage("Could not create a new resume right now.");
        return;
      }

      const result = (await response.json()) as { resume: ResumeListItem };
      router.push(`/dashboard/resumes/${result.resume.id}`);
      router.refresh();
    });
  };

  const deleteResume = (id: string) => {
    const previous = resumes;
    setMessage("");
    setResumes((items) => items.filter((item) => item.id !== id));

    startTransition(async () => {
      const response = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setResumes(previous);
        setMessage("Could not delete resume.");
        return;
      }

      setMessage("Resume deleted.");
      router.refresh();
    });
  };

  const duplicateResume = (id: string) => {
    setMessage("");
    startTransition(async () => {
      const response = await fetch(`/api/resumes/${id}/duplicate`, {
        method: "POST",
      });

      if (!response.ok) {
        setMessage("Could not duplicate resume.");
        return;
      }

      const result = (await response.json()) as { resume: ResumeListItem };
      setResumes((items) => [result.resume, ...items]);
      setMessage("Resume duplicated.");
      router.refresh();
    });
  };

  const togglePublic = (id: string, isPublic: boolean) => {
    const previous = resumes;
    setResumes((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              isPublic,
            }
          : item,
      ),
    );

    startTransition(async () => {
      const response = await fetch(`/api/resumes/${id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setResumes(previous);
        setMessage(result?.error ?? "Could not update sharing setting.");
        return;
      }

      setMessage(isPublic ? "Public link enabled." : "Public link disabled.");
      router.refresh();
    });
  };

  const copyLink = async (slug: string) => {
    const url = `${getClientBaseUrl()}/r/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Public link copied to clipboard.");
    } catch {
      setMessage(`Copy failed. Here is your link: ${url}`);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your resumes
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Create, edit, duplicate, and share your resumes.
          </p>
        </div>
        <button
          type="button"
          onClick={createResume}
          disabled={isPending}
          className="ms-btn-primary px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
        >
          Create New Resume
        </button>
      </div>

      {message && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-200">
          {message}
        </p>
      )}

      {!resumes.length ? (
        <div className="ms-card p-8 text-center">
          <p className="text-sm text-[var(--muted)]">
            No resumes yet. Click{" "}
            <span className="font-medium">
              Create New Resume
            </span>{" "}
            to begin.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {resumes.map((resume) => (
            <article
              key={resume.id}
              className="ms-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">
                    {resume.title}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Updated {dateFormatter.format(new Date(resume.updatedAt))}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    Template: {resume.template}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                    resume.isPublic
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "bg-[var(--surface-muted)] text-[var(--muted)]"
                  }`}
                >
                  {resume.isPublic ? "Public" : "Private"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/resumes/${resume.id}`}
                  className="ms-btn-primary px-3 py-1.5 text-xs font-semibold"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => duplicateResume(resume.id)}
                  className="ms-btn-secondary px-3 py-1.5 text-xs font-medium"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => togglePublic(resume.id, !resume.isPublic)}
                  className="ms-btn-secondary px-3 py-1.5 text-xs font-medium"
                >
                  {resume.isPublic ? "Make Private" : "Publish Link"}
                </button>
                {resume.isPublic && (
                  <button
                    type="button"
                    onClick={() => copyLink(resume.slug)}
                    className="ms-btn-secondary px-3 py-1.5 text-xs font-medium"
                  >
                    Copy Link
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteResume(resume.id)}
                  className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
