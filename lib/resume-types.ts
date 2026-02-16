export type ResumeTemplate = "classic" | "modern";

export type SectionKey =
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "activities";

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedIn: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  organization: string;
  startDate: string;
  endDate: string;
  description: string;
  bullets: string[];
  link: string;
}

export interface ActivityItem {
  id: string;
  name: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  sectionOrder: SectionKey[];
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  activities: ActivityItem[];
}
