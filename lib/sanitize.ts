import type { ResumeData } from "@/lib/resume-types";

const TAG_REGEX = /<\/?[^>]+(>|$)/g;
const CONTROL_REGEX = /[\u0000-\u001F\u007F]/g;

export function sanitizeText(value: unknown, maxLength = 400) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(TAG_REGEX, " ")
    .replace(CONTROL_REGEX, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeMultiline(value: unknown, maxLength = 1500) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(TAG_REGEX, " ")
    .replace(CONTROL_REGEX, " ")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, maxLength);
}

export function sanitizeStringArray(
  values: unknown,
  maxItems = 20,
  itemLength = 120,
) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .slice(0, maxItems)
    .map((item) => sanitizeText(item, itemLength))
    .filter(Boolean);
}

export function sanitizeResumeData(input: ResumeData): ResumeData {
  return {
    personalInfo: {
      name: sanitizeText(input.personalInfo?.name, 100),
      email: sanitizeText(input.personalInfo?.email, 140),
      phone: sanitizeText(input.personalInfo?.phone, 40),
      location: sanitizeText(input.personalInfo?.location, 100),
      website: sanitizeText(input.personalInfo?.website, 200),
      linkedIn: sanitizeText(input.personalInfo?.linkedIn, 200),
    },
    summary: sanitizeMultiline(input.summary, 600),
    sectionOrder: input.sectionOrder,
    experience: input.experience.map((entry) => ({
      id: sanitizeText(entry.id, 64),
      role: sanitizeText(entry.role, 120),
      company: sanitizeText(entry.company, 120),
      startDate: sanitizeText(entry.startDate, 40),
      endDate: sanitizeText(entry.endDate, 40),
      description: sanitizeMultiline(entry.description, 900),
      bullets: sanitizeStringArray(entry.bullets, 8, 220),
    })),
    education: input.education.map((entry) => ({
      id: sanitizeText(entry.id, 64),
      school: sanitizeText(entry.school, 140),
      degree: sanitizeText(entry.degree, 120),
      fieldOfStudy: sanitizeText(entry.fieldOfStudy, 120),
      startDate: sanitizeText(entry.startDate, 40),
      endDate: sanitizeText(entry.endDate, 40),
      gpa: sanitizeText(entry.gpa, 20),
    })),
    skills: sanitizeStringArray(input.skills, 40, 60),
    projects: input.projects.map((entry) => ({
      id: sanitizeText(entry.id, 64),
      name: sanitizeText(entry.name, 120),
      organization: sanitizeText(entry.organization, 120),
      startDate: sanitizeText(entry.startDate, 40),
      endDate: sanitizeText(entry.endDate, 40),
      description: sanitizeMultiline(entry.description, 900),
      bullets: sanitizeStringArray(entry.bullets, 8, 220),
      link: sanitizeText(entry.link, 220),
    })),
    activities: input.activities.map((entry) => ({
      id: sanitizeText(entry.id, 64),
      name: sanitizeText(entry.name, 120),
      organization: sanitizeText(entry.organization, 120),
      role: sanitizeText(entry.role, 120),
      startDate: sanitizeText(entry.startDate, 40),
      endDate: sanitizeText(entry.endDate, 40),
      description: sanitizeMultiline(entry.description, 600),
    })),
  };
}
