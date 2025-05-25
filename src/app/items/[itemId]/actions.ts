"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { bids, items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createBidAction(itemId: number) {
  const session = await auth();

  if (!session) {
    throw new Error("You must be signed in to create a bid");
  }

  if (!session.user || !session.user.id) {
    throw new Error("You must be signed in to create a bid");
  }

  const item = await database.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (!item) {
    throw new Error("Item not found");
  }

  const latestBid = item.currentBid + item.bidInterval;

  await database?.insert(bids).values({
    amount: latestBid,
    itemId: itemId,
    userId: session.user.id,
    timestamp: new Date(),
  });

  await database
    ?.update(items)
    .set({
      currentBid: latestBid,
    })
    .where(eq(items.id, itemId));

  revalidatePath(`/items/${itemId}`);
}
