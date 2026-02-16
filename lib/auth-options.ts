import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { loginSchema } from "@/lib/validation";

function getIpFromAuthRequest(request: unknown) {
  const headers =
    (request as { headers?: Record<string, string | string[] | undefined> })
      ?.headers ?? {};
  const forwarded = headers["x-forwarded-for"];

  if (Array.isArray(forwarded)) {
    return forwarded[0]?.split(",")[0]?.trim() || "unknown";
  }

  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }

  const realIp = headers["x-real-ip"];
  if (Array.isArray(realIp)) {
    return realIp[0] || "unknown";
  }

  if (typeof realIp === "string") {
    return realIp;
  }

  return "unknown";
}

const providers: NextAuthOptions["providers"] = [
  Credentials({
    name: "Email and Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials, request) {
      const ip = getIpFromAuthRequest(request);
      const limiter = rateLimit({
        key: `login:${ip}`,
        limit: 10,
        windowMs: 60_000,
      });

      if (!limiter.success) {
        throw new Error("Too many login attempts. Please wait and try again.");
      }

      const parsed = loginSchema.safeParse({
        email: sanitizeText(credentials?.email, 140).toLowerCase(),
        password:
          typeof credentials?.password === "string"
            ? credentials.password
            : "",
      });

      if (!parsed.success) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email },
      });

      if (!user?.password) {
        return null;
      }

      const validPassword = await bcrypt.compare(
        parsed.data.password,
        user.password,
      );

      if (!validPassword) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name ?? "Student",
        image: user.image ?? undefined,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  providers,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 14,
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  callbacks: {
    async jwt({ token, user, account }) {
      if (user?.id) {
        token.userId = user.id;
      }

      if (account?.provider === "google") {
        const email = sanitizeText(token.email, 140).toLowerCase();
        if (email) {
          const existing = await prisma.user.findUnique({
            where: { email },
          });

          if (existing) {
            token.userId = existing.id;
            token.name = existing.name ?? token.name;
            token.picture = existing.image ?? token.picture;
          } else {
            const created = await prisma.user.create({
              data: {
                email,
                name: sanitizeText(token.name, 80) || "Student",
                image: sanitizeText(token.picture, 220) || null,
              },
            });

            token.userId = created.id;
          }
        }
      }

      if (token.userId) {
        token.sub = token.userId as string;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }

      return session;
    },
  },
};
