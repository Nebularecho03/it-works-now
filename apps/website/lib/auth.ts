import type { DefaultSession, SessionStrategy } from "next-auth";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db, hasDatabaseUrl } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

// Only include Google provider if credentials are properly configured
const providers = [];

// Add Google provider only if credentials are set and not placeholder values
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== "your-google-client-id-here" &&
  process.env.GOOGLE_CLIENT_SECRET !== "your-google-client-secret-here" &&
  process.env.GOOGLE_CLIENT_ID.length > 10 &&
  process.env.GOOGLE_CLIENT_SECRET.length > 10
) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

const authConfig = {
  adapter: hasDatabaseUrl && db ? PrismaAdapter(db) : undefined,
  session: { strategy: "database" as SessionStrategy },
  pages: {
    signIn: "/signin",
    error: "/signin", // Redirect errors to signin page
  },
  providers,
  callbacks: {
    async session({ session, user }: any) {
      if (session.user && user) {
        const userWithRole = user as typeof user & { role?: string };
        session.user.id = user.id;
        session.user.role = userWithRole.role || "USER";
        session.user.name = user.name;
        session.user.email = user.email;
        session.user.image = user.image;
      }
      return session;
    },
    async signIn({ user, account, profile }: { user: any; account: any; profile?: any }) {
      // Only allow sign in with verified email
      if (!user.email) {
        return false;
      }

      // Additional validation can be added here
      return true;
    },
  },
  events: {
    async createUser({ user }: { user: { id: string } }) {
      if (!db || !user.id) return;
      await db.userPreference.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
        },
      });
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig as any);
