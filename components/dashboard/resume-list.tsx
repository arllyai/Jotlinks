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
    await navigator.clipboard.writeText(url);
    setMessage("Public link copied to clipboard.");
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Your resumes
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Create, edit, duplicate, and share your resumes.
          </p>
        </div>
        <button
          type="button"
          onClick={createResume}
          disabled={isPending}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
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
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            No resumes yet. Click{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
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
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {resume.title}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Updated {dateFormatter.format(new Date(resume.updatedAt))}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    Template: {resume.template}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                    resume.isPublic
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {resume.isPublic ? "Public" : "Private"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/resumes/${resume.id}`}
                  className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => duplicateResume(resume.id)}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => togglePublic(resume.id, !resume.isPublic)}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {resume.isPublic ? "Make Private" : "Publish Link"}
                </button>
                {resume.isPublic && (
                  <button
                    type="button"
                    onClick={() => copyLink(resume.slug)}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Copy Link
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteResume(resume.id)}
                  className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-900/20"
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
