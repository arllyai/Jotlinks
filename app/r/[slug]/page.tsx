import { notFound } from "next/navigation";

import { ResumeDocument } from "@/components/resume/resume-document";
import { prisma } from "@/lib/prisma";
import { resumeDataSchema, resumeTemplateSchema } from "@/lib/validation";

export default async function PublicResumePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const resume = await prisma.resume.findUnique({
    where: {
      slug,
    },
    select: {
      title: true,
      template: true,
      data: true,
      isPublic: true,
    },
  });

  if (!resume?.isPublic) {
    notFound();
  }

  const dataValidation = resumeDataSchema.safeParse(resume.data);
  const templateValidation = resumeTemplateSchema.safeParse(resume.template);

  if (!dataValidation.success || !templateValidation.success) {
    notFound();
  }

  return (
    <div className="space-y-4 py-4">
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {resume.title}
      </h1>
      <ResumeDocument data={dataValidation.data} template={templateValidation.data} />
    </div>
  );
}
