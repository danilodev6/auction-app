"use server";

import { redirect } from "next/navigation";
import { database } from "@/db/database";
import { users } from "@/db/schema";
import { like, eq } from "drizzle-orm";
import { auth, isAdmin } from "@/auth";

export async function getUsersByName(name: string) {
  const session = await auth();

  if (!session || !(await isAdmin(session))) {
    redirect("/");
  }

  return await database
    .select()
    .from(users)
    .where(like(users.name, `%${name}%`));
}

export async function updateUserRole(userId: string, newRole: string) {
  await database
    .update(users)
    .set({ role: newRole })
    .where(eq(users.id, userId));
}

export async function deleteUserById(userId: string) {
  const session = await auth();

  if (!session || !(await isAdmin(session))) {
    redirect("/");
  }

  await database.delete(users).where(eq(users.id, String(userId)));
}

// Toggle user/admin role
export async function toggleUserRole(userId: string) {
  const session = await auth();

  if (!session || !(await isAdmin(session))) {
    redirect("/");
  }

  const [user] = await database
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, String(userId)))
    .limit(1);

  if (!user) throw new Error("User not found");

  const newRole = user.role === "admin" ? "user" : "admin";

  await database
    .update(users)
    .set({ role: newRole })
    .where(eq(users.id, String(userId)));
}
