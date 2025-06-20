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

export async function purchaseItemAction(itemId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("You must be signed in to purchase an item");
  }

  try {
    // Get the item to verify it's a direct sale
    const item = await database.query.items.findFirst({
      where: (items, { eq }) => eq(items.id, itemId),
    });

    if (!item) {
      throw new Error("Item not found");
    }

    if (item.auctionType !== "direct") {
      throw new Error("This item is not available for direct purchase");
    }

    await database
      .update(items)
      .set({
        status: "sold",
        soldTo: session.user.id,
        soldAt: new Date(),
      })
      .where(eq(items.id, itemId));
    revalidatePath(`/item/${itemId}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Purchase error:", error);
    throw new Error(
      `Failed to purchase item: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

