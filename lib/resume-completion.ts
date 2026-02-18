import type { ResumeData } from "@/lib/resume-types";

function hasNonEmptyText(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export function isResumeReadyForCheckout(data: ResumeData) {
  const hasPersonalBasics =
    hasNonEmptyText(data.personalInfo.name) &&
    hasNonEmptyText(data.personalInfo.email);

  const hasCoreSection =
    data.education.length > 0 ||
    data.experience.length > 0 ||
    data.projects.length > 0 ||
    data.activities.length > 0;

  return hasPersonalBasics && hasCoreSection;
}
