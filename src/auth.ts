import { Session } from "next-auth";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { database } from "@/db/database";
import { accounts, sessions, users, verificationTokens } from "./db/schema";
import { eq } from "drizzle-orm";
import { DefaultSession } from "next-auth";

// Extend NextAuth types to include role and phone
declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      role: string;
      phone?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    phone?: string | null;
  }
}

// Define a custom user type with role and phone properties
interface CustomUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  phone?: string | null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(database, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [Google],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.role = (user as CustomUser).role;
        session.user.phone = (user as CustomUser).phone;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If user is being redirected after sign-in, check if they need to complete profile
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // For sign-in redirects, we'll handle the phone check in middleware or page components
      // This allows the sign-in to complete first, then we can check the user's phone
      return baseUrl;
    },
  },
  pages: {
    // signIn: '/auth/signin',
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

// Helper function to check if user needs to complete their profile
export async function needsPhoneNumber(sessionEmail: string): Promise<boolean> {
  if (!sessionEmail) {
    return false;
  }

  try {
    const user = await database.query.users.findFirst({
      where: eq(users.email, sessionEmail),
      columns: {
        phone: true,
      },
    });

    // Return true if phone is null or empty
    return !user?.phone || user.phone.trim() === "";
  } catch (error) {
    console.error("Error checking phone status:", error);
    return false;
  }
}

// import { Session } from "next-auth";
// import NextAuth from "next-auth";
// import Google from "next-auth/providers/google";
// import { DrizzleAdapter } from "@auth/drizzle-adapter";
// import { database } from "@/db/database";
// import { accounts, sessions, users, verificationTokens } from "./db/schema";
// import { eq } from "drizzle-orm";
// import { DefaultSession } from "next-auth";
//
// // Extend NextAuth types to include role
// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user?: {
//       role: string;
//     } & DefaultSession["user"];
//   }
//
//   interface User {
//     role: string;
//   }
// }
//
// // Define a custom user type with role property
// interface CustomUser {
//   id: string;
//   name?: string | null;
//   email?: string | null;
//   image?: string | null;
//   role: string;
// }
//
// export const { handlers, signIn, signOut, auth } = NextAuth({
//   adapter: DrizzleAdapter(database, {
//     usersTable: users,
//     accountsTable: accounts,
//     sessionsTable: sessions,
//     verificationTokensTable: verificationTokens,
//   }),
//   providers: [Google],
//   callbacks: {
//     async session({ session, user }) {
//       if (session.user) {
//         session.user.role = (user as CustomUser).role;
//       }
//       return session;
//     },
//   },
// });
//
// export async function isAdmin(session: Session | null): Promise<boolean> {
//   if (!session?.user?.email) {
//     return false;
//   }
//
//   try {
//     const user = await database.query.users.findFirst({
//       where: eq(users.email, session.user.email),
//       columns: {
//         role: true,
//       },
//     });
//
//     return user?.role === "admin";
//   } catch (error) {
//     console.error("Error checking admin status:", error);
//     return false;
//   }
// }

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
