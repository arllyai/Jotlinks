import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { IntegrationStatus } from "@/components/dashboard/integration-status";
import { ResumeList } from "@/components/dashboard/resume-list";
import { authOptions } from "@/lib/auth-options";
import { getIntegrationStatus } from "@/lib/integrations";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resumes = await prisma.resume.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
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

  return (
    <div className="space-y-6">
      <IntegrationStatus status={getIntegrationStatus()} />
      <ResumeList
        initialResumes={resumes.map((resume) => ({
          ...resume,
          updatedAt: resume.updatedAt.toISOString(),
          createdAt: resume.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
