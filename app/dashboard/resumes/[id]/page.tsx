import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { ResumeBuilder } from "@/components/builder/resume-builder";
import { prisma } from "@/lib/prisma";
import { resumeDataSchema, resumeTemplateSchema } from "@/lib/validation";

export default async function ResumeBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const resume = await prisma.resume.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      template: true,
      isPublic: true,
      slug: true,
      data: true,
    },
  });

  if (!resume) {
    notFound();
  }

  const dataValidation = resumeDataSchema.safeParse(resume.data);
  const templateValidation = resumeTemplateSchema.safeParse(resume.template);

  if (!dataValidation.success || !templateValidation.success) {
    notFound();
  }

  return (
    <ResumeBuilder
      initialResume={{
        id: resume.id,
        title: resume.title,
        template: templateValidation.data,
        isPublic: resume.isPublic,
        slug: resume.slug,
        data: dataValidation.data,
      }}
    />
  );
}
