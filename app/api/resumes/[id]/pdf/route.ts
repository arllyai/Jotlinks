import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";

import { getUserBillingState } from "@/lib/billing";
import { buildResumePdf } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { resumeDataSchema, resumeTemplateSchema } from "@/lib/validation";

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

  const billingState = await getUserBillingState(userId);
  if (!billingState.hasAccess) {
    return NextResponse.json(
      {
        error:
          "Payment required. Complete checkout to export your resume as PDF.",
      },
      { status: 402 },
    );
  }

  const { id } = await params;

  const resume = await prisma.resume.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      title: true,
      template: true,
      data: true,
    },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const dataValidation = resumeDataSchema.safeParse(resume.data);
  const templateValidation = resumeTemplateSchema.safeParse(resume.template);

  if (!dataValidation.success || !templateValidation.success) {
    return NextResponse.json(
      { error: "Resume format is invalid and cannot be exported." },
      { status: 400 },
    );
  }

  const bytes = await buildResumePdf({
    title: resume.title,
    template: templateValidation.data,
    data: dataValidation.data,
  });

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${resume.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "resume"}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
