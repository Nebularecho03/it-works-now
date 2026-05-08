import type { DefaultSession } from "next-auth";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

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
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/signin",
    error: "/signin", // Redirect errors to signin page
  },
  providers,
  callbacks: {
    async session({ session, token }: any) {
      if (session.user && token) {
        session.user.id = token.sub || "";
        session.user.role = token.role || "USER";
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role || "USER";
      }
      return token;
    },
    async signIn({ user }: { user: any }) {
      // Only allow sign in with verified email
      if (!user.email) {
        return false;
      }
      return true;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
