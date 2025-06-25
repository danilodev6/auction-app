"use server";

import { database } from "@/db/database";
import { users } from "@/db/schema";
import { like } from "drizzle-orm";
import { auth, isAdmin } from "@/auth";

export async function getUsersByName(name: string) {
  const session = await auth();
  if (!session || !(await isAdmin(session))) return [];

  return await database
    .select()
    .from(users)
    .where(like(users.name, `%${name}%`));
}
