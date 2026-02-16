import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { isSameOrigin } from "@/lib/request";
import { getSessionUserId } from "@/lib/session";
import { buildResumeSlug } from "@/lib/slug";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function POST(request: Request, { params }: Params) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Blocked request origin." }, { status: 403 });
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.resume.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const duplicateTitle = `${existing.title} (Copy)`.slice(0, 120);
  const slug = await generateUniqueSlug(duplicateTitle);

  const resume = await prisma.resume.create({
    data: {
      userId,
      title: duplicateTitle,
      template: existing.template,
      data: existing.data,
      slug,
      isPublic: false,
    },
    select: {
      id: true,
      title: true,
      template: true,
      slug: true,
      isPublic: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ resume }, { status: 201 });
}
