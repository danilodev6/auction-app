import { Session } from "next-auth";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { database } from "@/db/database";
import { accounts, sessions, users, verificationTokens } from "./db/schema";
import { eq } from "drizzle-orm";
import { DefaultSession, DefaultUser } from "next-auth";

// Extend NextAuth types to include role
declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      role: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(database, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google,
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID!,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
      authorization: {
        params: {
          scope: "email",
        },
      },
    }),
  ],
  trustHost: true,
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.role = user.role;
      }
      return session;
    },
  },
});

export async function isAdmin(session: Session | null): Promise<boolean> {
  if (!session?.user?.email) {
    return false;
  }

  try {
    const user = await database.query.users.findFirst({
      where: eq(users.email, session.user.email),
      columns: {
        role: true,
      },
    });

    return user?.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// import { Session } from "next-auth";
// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";
// import { DrizzleAdapter } from "@auth/drizzle-adapter";
// import { database } from "@/db/database";
// import { accounts, sessions, users, verificationTokens } from "./db/schema";
//
// export const { handlers, signIn, signOut, auth } = NextAuth({
//   adapter: DrizzleAdapter(database, {
//     usersTable: users,
//     accountsTable: accounts,
//     sessionsTable: sessions,
//     verificationTokensTable: verificationTokens,
//   }),
//   providers: [Google],
//   trustHost: true, // This fixes the UntrustedHost error for production deployment
// });
//
// export const ADMINS = process.env.ADMIN_EMAILS?.split(",") || [];
//
// export async function isAdmin(session: Session | null): Promise<boolean> {
//   if (!session?.user?.email) {
//     return false;
//   }
//   return ADMINS.includes(session.user.email);
// }
