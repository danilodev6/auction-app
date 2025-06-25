import { NextResponse } from "next/server";
import { database } from "@/db/database";
import { users } from "@/db/schema";
import { auth, isAdmin } from "@/auth";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !(await isAdmin(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const userId = form.get("userId") as string;
  const block = form.get("block") === "true";

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  await database
    .update(users)
    .set({ role: block ? "blocked" : "user" })
    .where(eq(users.id, userId));

  return NextResponse.redirect(new URL("/admin/users", req.url));
}
