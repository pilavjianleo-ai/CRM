import type { NextAuthConfig } from "next-auth";

const authConfig = {
  providers: [],
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? "relations-system-dev-secret",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.workspaceId = (user as { workspaceId?: string }).workspaceId;
        token.role = (user as { role?: string }).role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.workspaceId =
          typeof token.workspaceId === "string" ? token.workspaceId : "";
        session.user.role = typeof token.role === "string" ? token.role : "MEMBER";
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
