import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";
import { NextResponse } from "next/server";

import { fallbackBullets } from "@/lib/ai";
import { getAiProvider } from "@/lib/integrations";
import { getClientIp, isSameOrigin } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeMultiline, sanitizeText } from "@/lib/sanitize";
import { getSessionUserId } from "@/lib/session";
import { generateBulletsSchema } from "@/lib/validation";

function cleanBullets(rawOutput: string) {
  return rawOutput
    .split("\n")
    .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
    .map((line) => line.replace(/^"|"$/g, "").trim())
    .filter(Boolean)
    .filter((line) => line.length > 10)
    .slice(0, 5);
}

const aiSystemPrompt =
  "You write resume bullets for students and entry-level candidates. Return 3-5 concise bullet lines only. Start each line with an action verb. Prefer quantified outcomes when plausible. No intro text.";

function buildUserPrompt(input: {
  role: string;
  organization: string;
  description: string;
}) {
  return `Role: ${input.role}\nOrganization: ${input.organization}\nWhat I did: ${input.description}`;
}

async function generateWithConfiguredProvider(input: {
  role: string;
  organization: string;
  description: string;
}) {
  const prompt = buildUserPrompt(input);
  const provider = getAiProvider();

  if (provider === "xai") {
    const result = await generateText({
      model: xai(process.env.XAI_MODEL ?? "grok-2-1212"),
      system: aiSystemPrompt,
      prompt,
      temperature: 0.4,
      maxOutputTokens: 350,
    });

    return {
      source: "xai" as const,
      bullets: cleanBullets(result.text),
    };
  }

  if (provider === "openai") {
    const result = await generateText({
      model: openai(process.env.OPENAI_MODEL ?? "gpt-4.1-mini"),
      system: aiSystemPrompt,
      prompt,
      temperature: 0.4,
      maxOutputTokens: 350,
    });

    return {
      source: "openai" as const,
      bullets: cleanBullets(result.text),
    };
  }

  return null;
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

  const provider = getAiProvider();

  if (provider === "none") {
    return NextResponse.json({ bullets: fallback, source: "fallback" });
  }

  try {
    const response = await generateWithConfiguredProvider(parsed.data);

    if (!response || response.bullets.length < 3) {
      return NextResponse.json({
        bullets: fallback,
        source: "fallback",
      });
    }

    return NextResponse.json({
      bullets: response.bullets,
      source: response.source,
    });
  } catch {
    return NextResponse.json({
      bullets: fallback,
      source: "fallback",
    });
  }
}
