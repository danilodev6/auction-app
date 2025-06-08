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

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { database } from "@/db/database";
import { accounts, sessions, users, verificationTokens } from "./db/schema";

export const ADMINS = ["danilo.dev6@gmail.com", "other.admin@company.com"];

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(database, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [Google],
});

// Add this function to check if a user is an admin
export async function isAdmin(session: any): Promise<boolean> {
  if (!session?.user?.email) {
    return false;
  }

  return ADMINS.includes(session.user.email);
}
