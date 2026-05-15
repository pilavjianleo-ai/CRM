import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

import authConfig from "@/auth.config";
import { getPrisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation/auth";

const localDemoUser = {
  id: "local-demo-user",
  email: "philip@relationssystem.se",
  password: "Demo123!",
  name: "Philip Pilav",
  workspaceId: "local-demo-workspace",
  role: "OWNER",
} as const;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "E-post och lösenord",
      credentials: {
        email: { label: "E-post", type: "email" },
        password: { label: "Lösenord", type: "password" },
      },
      async authorize(rawCredentials) {
        const credentials = loginSchema.safeParse(rawCredentials);

        if (!credentials.success) {
          return null;
        }

        const prisma = getPrisma();

        if (!prisma) {
          if (
            process.env.NODE_ENV !== "production" &&
            credentials.data.email === localDemoUser.email &&
            credentials.data.password === localDemoUser.password
          ) {
            return {
              id: localDemoUser.id,
              email: localDemoUser.email,
              name: localDemoUser.name,
              workspaceId: localDemoUser.workspaceId,
              role: localDemoUser.role,
            };
          }

          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.data.email,
            isActive: true,
          },
          include: {
            memberships: {
              take: 1,
            },
          },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await compare(
          credentials.data.password,
          user.passwordHash,
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          workspaceId: user.workspaceId,
          role: user.memberships[0]?.role ?? "MEMBER",
        };
      },
    }),
  ],
});
