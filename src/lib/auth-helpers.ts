import { auth } from "@/auth";
import { database } from "@/db/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function checkUserBlocked() {
  const session = await auth();

  if (!session?.user?.email) {
    return false; // Not logged in, let normal auth handle it
  }

  try {
    const [user] = await database
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, session.user.email));

    if (user && user.role === "blocked") {
      return true; // User is blocked
    }

    return false; // User is not blocked
  } catch (error) {
    console.error("Error checking user block status:", error);
    return false; // On error, don't block (fail open)
  }
}

export async function requireNotBlocked() {
  const isBlocked = await checkUserBlocked();

  if (isBlocked) {
    redirect("/blocked"); // Redirect to a blocked page
  }
}

// Alternative: Get user with block status
export async function getUserWithBlockStatus() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  try {
    const [user] = await database
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, session.user.email));

    return user || null;
  } catch (error) {
    console.error("Error fetching user with block status:", error);
    return null;
  }
}
