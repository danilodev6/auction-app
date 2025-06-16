import { database } from "./database";
import { users } from "./schema";
import { eq } from "drizzle-orm";

async function migrateAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;

  // Update existing admin user to have admin role
  await database
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.email, adminEmail));

  console.log(`Updated ${adminEmail} to admin role`);
}
