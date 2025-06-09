// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";
// import { DrizzleAdapter } from "@auth/drizzle-adapter";
// import { database } from "@/db/database";
// import { accounts, sessions, users, verificationTokens } from "./db/schema";
//
// export const ADMINS = ["danilozabalet@gmail.com", "other.admin@company.com"];
//
// export const { handlers, signIn, signOut, auth } = NextAuth({
//   adapter: DrizzleAdapter(database, {
//     usersTable: users,
//     accountsTable: accounts,
//     sessionsTable: sessions,
//     verificationTokensTable: verificationTokens,
//   }),
//   providers: [Google],
// });

import { Session } from "next-auth";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { database } from "@/db/database";
import { accounts, sessions, users, verificationTokens } from "./db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(database, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [Google],
  trustHost: true, // This fixes the UntrustedHost error for production deployment
});

export const ADMINS = process.env.ADMIN_EMAILS?.split(",") || [];

export async function isAdmin(session: Session | null): Promise<boolean> {
  if (!session?.user?.email) {
    return false;
  }
  return ADMINS.includes(session.user.email);
}
