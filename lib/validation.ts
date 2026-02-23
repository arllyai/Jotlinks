import { z } from "zod";

export const sectionKeySchema = z.enum([
  "education",
  "experience",
  "projects",
  "skills",
  "activities",
]);

const idSchema = z.string().min(1).max(64);

const experienceSchema = z.object({
  id: idSchema,
  role: z.string().max(120),
  company: z.string().max(120),
  startDate: z.string().max(40),
  endDate: z.string().max(40),
  description: z.string().max(900),
  bullets: z.array(z.string().max(220)).max(8),
});

const educationSchema = z.object({
  id: idSchema,
  school: z.string().max(140),
  degree: z.string().max(120),
  fieldOfStudy: z.string().max(120),
  startDate: z.string().max(40),
  endDate: z.string().max(40),
  gpa: z.string().max(20),
});

const projectSchema = z.object({
  id: idSchema,
  name: z.string().max(120),
  organization: z.string().max(120),
  startDate: z.string().max(40),
  endDate: z.string().max(40),
  description: z.string().max(900),
  bullets: z.array(z.string().max(220)).max(8),
  link: z.string().max(220),
});

const activitySchema = z.object({
  id: idSchema,
  name: z.string().max(120),
  organization: z.string().max(120),
  role: z.string().max(120),
  startDate: z.string().max(40),
  endDate: z.string().max(40),
  description: z.string().max(600),
});

export const resumeDataSchema = z.object({
  personalInfo: z.object({
    name: z.string().max(100),
    email: z.string().max(140),
    phone: z.string().max(40),
    location: z.string().max(100),
    website: z.string().max(200),
    linkedIn: z.string().max(200),
  }),
  summary: z.string().max(600),
  sectionOrder: z
    .array(sectionKeySchema)
    .length(5)
    .refine((value) => new Set(value).size === value.length, {
      message: "Section order must not contain duplicates.",
    }),
  experience: z.array(experienceSchema).max(15),
  education: z.array(educationSchema).max(10),
  skills: z.array(z.string().max(60)).max(40),
  projects: z.array(projectSchema).max(15),
  activities: z.array(activitySchema).max(15),
});

export const resumeTemplateSchema = z.enum(["classic", "modern"]);

export const createResumeSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  template: resumeTemplateSchema.optional(),
});

export const updateResumeSchema = z.object({
  title: z.string().min(1).max(120),
  template: resumeTemplateSchema,
  isPublic: z.boolean(),
  data: resumeDataSchema,
});

export const signupSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(140),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.string().email().max(140),
  password: z.string().min(8).max(72),
});

export const generateBulletsSchema = z.object({
  role: z.string().min(1).max(120),
  organization: z.string().min(1).max(120),
  description: z.string().min(10).max(900),
});
