import { NextResponse } from "next/server";

import { createEmptyResumeData } from "@/lib/default-resume";
import { prisma } from "@/lib/prisma";
import { isSameOrigin } from "@/lib/request";
import { sanitizeText } from "@/lib/sanitize";
import { getSessionUserId } from "@/lib/session";
import { buildResumeSlug } from "@/lib/slug";
import { createResumeSchema } from "@/lib/validation";

async function generateUniqueSlug(title: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = buildResumeSlug(title);
    const exists = await prisma.resume.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!exists) {
      return slug;
    }
  }

  return buildResumeSlug(`${title}-${Date.now()}`);
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      template: true,
      isPublic: true,
      slug: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ resumes });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Blocked request origin." }, { status: 403 });
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = createResumeSchema.safeParse({
    title: sanitizeText((body as Record<string, unknown>)?.title, 120) || "My Resume",
    template: sanitizeText((body as Record<string, unknown>)?.template, 20) || "classic",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Unable to create resume from provided input." },
      { status: 400 },
    );
  }

  const slug = await generateUniqueSlug(parsed.data.title);

  const resume = await prisma.resume.create({
    data: {
      userId,
      title: parsed.data.title,
      template: parsed.data.template ?? "classic",
      slug,
      data: createEmptyResumeData(),
    },
    select: {
      id: true,
      title: true,
      template: true,
      isPublic: true,
      slug: true,
      updatedAt: true,
      createdAt: true,
      data: true,
    },
  });

  return NextResponse.json({ resume }, { status: 201 });
}
