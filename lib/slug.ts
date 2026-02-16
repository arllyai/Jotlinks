import { randomBytes } from "node:crypto";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function buildResumeSlug(title: string) {
  const base = slugify(title) || "resume";
  const suffix = randomBytes(3).toString("hex");
  return `${base}-${suffix}`;
}
