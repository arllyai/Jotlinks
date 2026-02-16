import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { isSameOrigin } from "@/lib/request";
import { sanitizeResumeData, sanitizeText } from "@/lib/sanitize";
import { getSessionUserId } from "@/lib/session";
import { resumeDataSchema, updateResumeSchema } from "@/lib/validation";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const resume = await prisma.resume.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
      title: true,
      template: true,
      isPublic: true,
      slug: true,
      data: true,
      updatedAt: true,
    },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  return NextResponse.json({ resume });
}

export async function PATCH(request: Request, { params }: Params) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Blocked request origin." }, { status: 403 });
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const dataValidation = resumeDataSchema.safeParse(
    (body as Record<string, unknown>)?.data,
  );

  if (!dataValidation.success) {
    return NextResponse.json(
      { error: "Invalid resume data format." },
      { status: 400 },
    );
  }

  const sanitizedData = sanitizeResumeData(dataValidation.data);

  const parsed = updateResumeSchema.safeParse({
    title: sanitizeText((body as Record<string, unknown>)?.title, 120),
    template: sanitizeText((body as Record<string, unknown>)?.template, 20),
    isPublic: (body as Record<string, unknown>)?.isPublic === true,
    data: sanitizedData,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Unable to validate resume changes." },
      { status: 400 },
    );
  }

  const resume = await prisma.resume.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      title: parsed.data.title,
      template: parsed.data.template,
      isPublic: parsed.data.isPublic,
      data: parsed.data.data,
    },
  });

  if (!resume.count) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Params) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Blocked request origin." }, { status: 403 });
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const result = await prisma.resume.deleteMany({
    where: {
      id,
      userId,
    },
  });

  if (!result.count) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
