import { sanitizeText } from "@/lib/sanitize";

export function fallbackBullets(input: {
  role: string;
  organization: string;
  description: string;
}) {
  const role = sanitizeText(input.role, 80) || "team member";
  const organization = sanitizeText(input.organization, 80) || "the organization";
  const description = sanitizeText(input.description, 200);

  return [
    `Supported ${organization} as a ${role}, contributing to day-to-day operations and team goals in a fast-paced setting.`,
    `Applied strong communication and problem-solving skills to deliver consistent, student-friendly service and outcomes.`,
    `Improved efficiency by organizing tasks, prioritizing deadlines, and following clear quality standards.`,
    description
      ? `Used experience from ${description.toLowerCase()} to complete responsibilities reliably and build professional workplace habits.`
      : `Took ownership of responsibilities, collaborated with teammates, and maintained dependable performance.`,
  ].slice(0, 4);
}
