import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { canonicalOrigin, getAppOrigin, legacyHost } from "@/lib/site-url";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      timeZone: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: "USER" | "ADMIN";
    timeZone: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: "USER" | "ADMIN";
    timeZone: string;
  }
}

const nextAuth = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET ?? "local-development-auth-secret-change-before-production",
  pages: {
    signIn: "/",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await verifyPassword(password, user.passwordHash))) {
          return null;
        }

        const role = user.role === "ADMIN" ? "ADMIN" : "USER";

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role,
          timeZone: user.timeZone,
        };
      },
    }),
  ],
  callbacks: {
    redirect({ url, baseUrl }) {
      const appOrigin = baseUrl || getAppOrigin();
      const redirectUrl = url.startsWith("/") ? new URL(url, appOrigin) : new URL(url);

      if (redirectUrl.hostname === legacyHost) {
        redirectUrl.protocol = "http:";
        redirectUrl.host = new URL(canonicalOrigin).host;

        return redirectUrl.toString();
      }

      if (redirectUrl.origin === appOrigin || redirectUrl.origin === canonicalOrigin) {
        return redirectUrl.toString();
      }

      return appOrigin;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.timeZone = user.timeZone;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role;
        session.user.timeZone = token.timeZone;
      }

      return session;
    },
  },
});

export const { handlers, signIn, signOut } = nextAuth;

export async function auth() {
  try {
    return await nextAuth.auth();
  } catch (error) {
    if (isJwtSessionError(error)) {
      console.warn("[auth] Ignoring invalid JWT session cookie. Clear local auth cookies if this repeats.");
      return null;
    }

    throw error;
  }
}

function isJwtSessionError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === "JWTSessionError" || error.message.includes("JWTSessionError") || error.message.includes("jwt_session_error"))
  );
}
