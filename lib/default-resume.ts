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

export function createStudentPresetResumeData(): ResumeData {
  return {
    personalInfo: {
      name: "Jordan Lee",
      email: "jordan.lee@school.edu",
      phone: "(555) 123-9876",
      location: "Austin, TX",
      website: "jordanlee.dev",
      linkedIn: "linkedin.com/in/jordanlee",
    },
    summary:
      "Computer science student seeking internship opportunities. Strong in full-stack development, teamwork, and building user-focused projects.",
    sectionOrder: [...defaultSectionOrder],
    education: [
      {
        id: newItemId(),
        school: "State University",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science",
        startDate: "Aug 2022",
        endDate: "May 2026",
        gpa: "3.7",
      },
    ],
    experience: [
      {
        id: newItemId(),
        role: "Campus IT Assistant",
        company: "University IT Services",
        startDate: "Sep 2023",
        endDate: "Present",
        description:
          "Supported students with technical issues and maintained computer lab equipment.",
        bullets: [
          "Resolved 25+ student technical support tickets per week with high satisfaction ratings.",
          "Maintained and updated lab devices to reduce downtime during peak class hours.",
          "Documented recurring issues and created quick guides that improved first-contact resolutions.",
        ],
      },
    ],
    projects: [
      {
        id: newItemId(),
        name: "StudyBuddy App",
        organization: "Personal Project",
        startDate: "Jan 2025",
        endDate: "Apr 2025",
        description:
          "Built a web app to help students organize study sessions and task deadlines.",
        bullets: [
          "Developed a React and Next.js app used by 60+ students to plan study schedules.",
          "Implemented secure authentication and dashboard analytics to track productivity trends.",
          "Improved load performance by optimizing database queries and client rendering.",
        ],
        link: "https://studybuddy-demo.example.com",
      },
    ],
    skills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "Git",
      "Team Communication",
    ],
    activities: [
      {
        id: newItemId(),
        name: "Coding Club",
        organization: "State University",
        role: "Project Lead",
        startDate: "Aug 2024",
        endDate: "Present",
        description:
          "Led a small team to build student-focused tools and organize coding workshops.",
      },
    ],
  };
}
