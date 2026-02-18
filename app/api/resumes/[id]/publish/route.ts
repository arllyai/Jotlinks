import { NextResponse } from "next/server";

import { getUserBillingState } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { isSameOrigin } from "@/lib/request";
import { getSessionUserId } from "@/lib/session";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: Params) {
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

  const { id } = await params;
  const isPublic = (body as Record<string, unknown>)?.isPublic === true;

  if (isPublic) {
    const billingState = await getUserBillingState(userId);
    if (!billingState.hasAccess) {
      return NextResponse.json(
        {
          error:
            "Payment required. Complete checkout before publishing a public link.",
        },
        { status: 402 },
      );
    }
  }

  const result = await prisma.resume.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      isPublic,
    },
  });

  if (!result.count) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
