import { eq } from "drizzle-orm";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import { ilike, or } from "drizzle-orm";

export async function getItem(itemId: number) {
  const item = await database.query.items.findFirst({
    where: eq(items.id, itemId),
  });
  return item;
}

export async function getAllItems() {
  return await database.query.items.findMany();
}

export async function getLiveItems() {
  return database.query.items.findMany({
    where: (item, { eq }) => eq(item.auctionType, "live"),
  });
}

export async function searchItemsByNameOrDescription(keyword: string) {
  if (!keyword.trim()) {
    return [];
  }

  return database.query.items.findMany({
    where: or(
      ilike(items.name, `%${keyword}%`),
      ilike(items.description, `%${keyword}%`),
    ),
  });
}
