import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getClientIp, isSameOrigin } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { signupSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Blocked request origin." },
      { status: 403 },
    );
  }

  const ip = getClientIp(request);
  const limiter = rateLimit({
    key: `signup:${ip}`,
    limit: 5,
    windowMs: 60_000,
  });

  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many sign up attempts. Please try again in a minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = signupSchema.safeParse({
    name: sanitizeText((body as Record<string, unknown>)?.name, 80),
    email: sanitizeText((body as Record<string, unknown>)?.email, 140).toLowerCase(),
    password:
      typeof (body as Record<string, unknown>)?.password === "string"
        ? ((body as Record<string, unknown>).password as string)
        : "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid name, email, and password." },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
    },
  });

  return NextResponse.json({ ok: true });
}
