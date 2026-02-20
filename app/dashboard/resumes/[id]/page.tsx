import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { ResumeBuilder } from "@/components/builder/resume-builder";
import { authOptions } from "@/lib/auth-options";
import { hasBillingAccessFromStatus } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { resumeDataSchema, resumeTemplateSchema } from "@/lib/validation";

export default async function ResumeBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ billing?: string }>;
}) {
  const session = await getServerSession(authOptions);

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

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      stripeSubscriptionStatus: true,
      stripeTrialEndsAt: true,
      stripeCurrentPeriodEnd: true,
    },
  });

  const billingStatus = user?.stripeSubscriptionStatus ?? "inactive";
  const resolvedSearchParams = await searchParams;

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
      billing={{
        hasAccess: hasBillingAccessFromStatus(billingStatus),
        status: billingStatus,
        trialEndsAt: user?.stripeTrialEndsAt?.toISOString() ?? null,
        currentPeriodEnd: user?.stripeCurrentPeriodEnd?.toISOString() ?? null,
      }}
      billingRedirectStatus={resolvedSearchParams.billing ?? null}
    />
  );
}
