import { NextResponse } from "next/server";

import { getIntegrationStatus } from "@/lib/integrations";
import { getSessionUserId } from "@/lib/session";

export async function GET() {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    status: getIntegrationStatus(),
  });
}
