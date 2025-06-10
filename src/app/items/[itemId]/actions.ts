"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { bids, items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher-server";

export async function createBidAction(itemId: number) {
  const session = await auth();

  if (!session || !session.user?.id) {
    throw new Error("You must be signed in to create a bid");
  }

  const item = await database.query.items.findFirst({
    where: eq(items.id, itemId),
  });

  if (!item) {
    throw new Error("Item not found");
  }

  const latestBid =
    item.currentBid === 0
      ? item.startingPrice
      : item.currentBid + item.bidInterval;

  // Create the bid and get the inserted record
  const [newBid] = await database
    .insert(bids)
    .values({
      amount: latestBid,
      itemId: itemId,
      userId: session.user.id,
      timestamp: new Date(),
    })
    .returning();

  // Update the item
  await database
    .update(items)
    .set({
      currentBid: latestBid,
    })
    .where(eq(items.id, itemId));

  // Trigger Pusher event
  await pusherServer.trigger(`item-${itemId}`, "new-bid", {
    bid: {
      ...newBid,
      users: {
        name: session.user.name || "Anonymous",
      },
    },
    currentBid: latestBid,
  });

  revalidatePath(`/items/${itemId}`);
}
