import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { loginSchema } from "@/lib/validation";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "Email and Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials, request) {
      const ip = getClientIp(request);
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

const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 14,
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = sanitizeText(user.email, 140).toLowerCase();
      if (!email) {
        return false;
      }

      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (existing) {
        (user as { id?: string }).id = existing.id;
        return true;
      }

      const created = await prisma.user.create({
        data: {
          email,
          name: sanitizeText(user.name, 80) || "Student",
          image: sanitizeText(user.image, 220) || null,
        },
      });

      (user as { id?: string }).id = created.id;
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
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

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
