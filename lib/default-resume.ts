import type {
  ActivityItem,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  ResumeData,
  SectionKey,
} from "@/lib/resume-types";

export const defaultSectionOrder: SectionKey[] = [
  "education",
  "experience",
  "projects",
  "skills",
  "activities",
];

export function newItemId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 12);
}

export function createEmptyExperience(): ExperienceItem {
  return {
    id: newItemId(),
    role: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
    bullets: [],
  };
}

export function createEmptyEducation(): EducationItem {
  return {
    id: newItemId(),
    school: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    gpa: "",
  };
}

export function createEmptyProject(): ProjectItem {
  return {
    id: newItemId(),
    name: "",
    organization: "",
    startDate: "",
    endDate: "",
    description: "",
    bullets: [],
    link: "",
  };
}

export function createEmptyActivity(): ActivityItem {
  return {
    id: newItemId(),
    name: "",
    organization: "",
    role: "",
    startDate: "",
    endDate: "",
    description: "",
  };
}

export function createEmptyResumeData(): ResumeData {
  return {
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedIn: "",
    },
    summary: "",
    sectionOrder: [...defaultSectionOrder],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    activities: [],
  };
}
