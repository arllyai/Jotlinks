import OpenAI from "openai";
import { NextResponse } from "next/server";

import { fallbackBullets } from "@/lib/ai";
import { getClientIp, isSameOrigin } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeMultiline, sanitizeText } from "@/lib/sanitize";
import { getSessionUserId } from "@/lib/session";
import { generateBulletsSchema } from "@/lib/validation";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

function cleanBullets(rawOutput: string) {
  return rawOutput
    .split("\n")
    .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
    .map((line) => line.replace(/^"|"$/g, "").trim())
    .filter(Boolean)
    .filter((line) => line.length > 10)
    .slice(0, 5);
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Blocked request origin." }, { status: 403 });
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const limiter = rateLimit({
    key: `ai:${userId}:${ip}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many AI requests. Please wait and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = generateBulletsSchema.safeParse({
    role: sanitizeText((body as Record<string, unknown>)?.role, 120),
    organization: sanitizeText(
      (body as Record<string, unknown>)?.organization,
      120,
    ),
    description: sanitizeMultiline(
      (body as Record<string, unknown>)?.description,
      900,
    ),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide role, organization, and a short description." },
      { status: 400 },
    );
  }

  const fallback = fallbackBullets(parsed.data);

  if (!openai) {
    return NextResponse.json({ bullets: fallback, source: "fallback" });
  }

  try {
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.4,
      max_output_tokens: 350,
      input: [
        {
          role: "system",
          content:
            "You write resume bullets for students and entry-level candidates. Return 3-5 concise bullet lines only. Start each line with an action verb. Prefer quantified outcomes when plausible. No intro text.",
        },
        {
          role: "user",
          content: `Role: ${parsed.data.role}\nOrganization: ${parsed.data.organization}\nWhat I did: ${parsed.data.description}`,
        },
      ],
    });

    const aiBullets = cleanBullets(response.output_text ?? "");

    if (aiBullets.length < 3) {
      return NextResponse.json({
        bullets: fallback,
        source: "fallback",
      });
    }

    return NextResponse.json({
      bullets: aiBullets,
      source: "openai",
    });
  } catch {
    return NextResponse.json({
      bullets: fallback,
      source: "fallback",
    });
  }
}
