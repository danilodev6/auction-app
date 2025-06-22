"use server";

import { auth, isAdmin } from "@/auth";
import { database } from "@/db/database";
import { InferModel } from "drizzle-orm";
import { items } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, desc, count } from "drizzle-orm";
import { supabase, BUCKET_NAME } from "@/lib/supabase";
import { bids } from "@/db/schema";
import { users } from "@/db/schema";

type ItemUpdate = Partial<InferModel<typeof items, "insert">>;

export async function UpdateItemAction(itemId: number, formData: FormData) {
  const session = await auth();

  if (!session) {
    throw new Error("You must be signed in to update an item");
  }

  if (!(await isAdmin(session))) {
    throw new Error("You must be an admin to update an item");
  }

  const user = session.user;

  if (!user || !user.id) {
    throw new Error("You must be signed in to update an item");
  }

  const startingPrice = formData.get("startingPrice") as string;
  const name = formData.get("name") as string;
  const file = formData.get("file") as File;
  const description = formData.get("description") as string;
  const bidInterval = formData.get("bidInterval") as string;
  const bidEndTime = formData.get("bidEndTime") as string;
  const auctionType = formData.get("auctionType") as string;
  const isFeatured = formData.get("isFeatured") === "true";

  let imageURL: string | undefined;

  // Only process image if a new file was uploaded
  if (file && file.size > 0) {
    try {
      const fileExtension = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExtension}`;
      const filePath = `${user.id}/${fileName}`;

      console.log(`Attempting to upload file to ${BUCKET_NAME}/${filePath}`);

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error details:", error);
        throw new Error(`Error uploading file: ${error.message}`);
      }

      console.log("File uploaded successfully:", data);

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

      console.log("Public URL:", publicUrl);
      imageURL = publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(
        `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  try {
    // If this item is being featured, unfeatured all other items first
    if (isFeatured && auctionType === "live") {
      await database.update(items).set({ isFeatured: false });
    }

    const updateData: ItemUpdate = {
      name,
      description,
      startingPrice: parseInt(startingPrice),
      bidInterval: parseInt(bidInterval),
      bidEndTime: new Date(bidEndTime || Date.now()),
      auctionType: auctionType || "regular",
      isFeatured: isFeatured && auctionType === "live",
    };

    // Only update imageURL if a new image was uploaded
    if (imageURL) {
      updateData.imageURL = imageURL;
    }

    await database.update(items).set(updateData).where(eq(items.id, itemId));

    console.log("Item updated successfully in database");
    revalidatePath("/");
    revalidatePath("/live");
    revalidatePath("/items/manage");
  } catch (dbError) {
    console.error("Database error:", dbError);
    throw new Error(
      `Failed to update item in database: ${dbError instanceof Error ? dbError.message : "Unknown error"}`,
    );
  }
}

export async function GetItemAction(itemId: number) {
  const session = await auth();

  if (!session) {
    throw new Error("You must be signed in to view an item");
  }

  if (!(await isAdmin(session))) {
    throw new Error("You must be an admin to view this item");
  }

  try {
    const item = await database
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .limit(1);

    if (item.length === 0) {
      throw new Error("Item not found");
    }

    return item[0];
  } catch (dbError) {
    console.error("Database error:", dbError);
    throw new Error(
      `Failed to fetch item: ${dbError instanceof Error ? dbError.message : "Unknown error"}`,
    );
  }
}

export async function GetAllItemsAction() {
  const session = await auth();

  if (!session) {
    throw new Error("You must be signed in to view items");
  }

  if (!(await isAdmin(session))) {
    throw new Error("You must be an admin to view all items");
  }

  try {
    const allItems = await database.select().from(items);

    return allItems;
  } catch (dbError) {
    console.error("Database error:", dbError);
    throw new Error(
      `Failed to fetch items: ${dbError instanceof Error ? dbError.message : "Unknown error"}`,
    );
  }
}

export async function ToggleFeaturedAction(itemId: number) {
  const session = await auth();

  if (!session) {
    throw new Error("You must be signed in to toggle featured status");
  }

  if (!(await isAdmin(session))) {
    throw new Error("You must be an admin to toggle featured status");
  }

  try {
    // Get the current item
    const currentItem = await database
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .limit(1);

    if (currentItem.length === 0) {
      throw new Error("Item not found");
    }

    const item = currentItem[0];

    // Only allow featuring for live auctions
    if (item.auctionType !== "live") {
      throw new Error("Only live auction items can be featured");
    }

    if (!item.isFeatured) {
      // If we're featuring this item, unfeatured all others first
      await database.update(items).set({ isFeatured: false });
      // Then feature this item
      await database
        .update(items)
        .set({ isFeatured: true })
        .where(eq(items.id, itemId));
    } else {
      // If we're unfeaturing this item
      await database
        .update(items)
        .set({ isFeatured: false })
        .where(eq(items.id, itemId));
    }

    revalidatePath("/");
    revalidatePath("/live");
    revalidatePath("/items/manage");
  } catch (dbError) {
    console.error("Database error:", dbError);
    throw new Error(
      `Failed to toggle featured status: ${dbError instanceof Error ? dbError.message : "Unknown error"}`,
    );
  }
}

export async function DeleteItemAction(itemId: number) {
  const session = await auth();

  if (!session) {
    throw new Error("You must be signed in to delete an item");
  }

  if (!(await isAdmin(session))) {
    throw new Error("You must be an admin to delete an item");
  }

  try {
    // First, get the item to check if it has an image to delete from storage
    const itemToDelete = await database
      .select()
      .from(items)
      .where(eq(items.id, itemId))
      .limit(1);

    if (itemToDelete.length === 0) {
      throw new Error("Item not found");
    }

    const item = itemToDelete[0];

    // If the item has an image, delete it from Supabase storage
    if (item.imageURL) {
      try {
        // Extract the file path from the public URL
        const url = new URL(item.imageURL);
        const pathParts = url.pathname.split("/");
        // The file path is typically after '/storage/v1/object/public/bucket-name/'
        const bucketIndex = pathParts.indexOf("public");
        if (bucketIndex !== -1 && bucketIndex + 2 < pathParts.length) {
          const filePath = pathParts.slice(bucketIndex + 2).join("/");

          const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

          if (error) {
            console.warn("Failed to delete image from storage:", error);
            // Don't throw here - we still want to delete the database record
          }
        }
      } catch (storageError) {
        console.warn("Error deleting image from storage:", storageError);
        // Don't throw here - we still want to delete the database record
      }
    }

    // Delete the item from the database
    await database.delete(items).where(eq(items.id, itemId));

    console.log("Item deleted successfully from database");
    revalidatePath("/");
    revalidatePath("/live");
    revalidatePath("/items/manage");
  } catch (dbError) {
    console.error("Database error:", dbError);
    throw new Error(
      `Failed to delete item: ${dbError instanceof Error ? dbError.message : "Unknown error"}`,
    );
  }
}

export async function GetAllItemsWithBidsAction() {
  const session = await auth();

  if (!session) {
    throw new Error("You must be signed in to view items");
  }

  if (!(await isAdmin(session))) {
    throw new Error("You must be an admin to view all items");
  }

  try {
    // First get all items
    const allItems = await database.select().from(items);

    // Then for each item, get the latest bid info
    const itemsWithBids = await Promise.all(
      allItems.map(async (item) => {
        // Get the latest bid for this item
        const latestBid = await database
          .select({
            amount: bids.amount,
            userId: bids.userId,
            timestamp: bids.timestamp,
          })
          .from(bids)
          .where(eq(bids.itemId, item.id))
          .orderBy(desc(bids.timestamp))
          .limit(1);

        // Get total bid count for this item
        const bidCount = await database
          .select({ count: count() })
          .from(bids)
          .where(eq(bids.itemId, item.id));

        let bidderInfo = null;
        if (latestBid.length > 0) {
          // Get bidder information
          const bidder = await database
            .select({
              name: users.name,
              email: users.email,
              phone: users.phone,
            })
            .from(users)
            .where(eq(users.id, latestBid[0].userId))
            .limit(1);

          bidderInfo = bidder.length > 0 ? bidder[0] : null;
        }

        let soldToInfo = null;
        if (item.auctionType === "direct" && item.soldTo) {
          const soldToUser = await database
            .select({
              name: users.name,
              email: users.email,
            })
            .from(users)
            .where(eq(users.id, item.soldTo))
            .limit(1);

          soldToInfo = soldToUser.length > 0 ? soldToUser[0] : null;
        }

        return {
          ...item,
          currentBid: latestBid.length > 0 ? latestBid[0].amount : null,
          bidTime: latestBid.length > 0 ? latestBid[0].timestamp : null,
          bidderName: bidderInfo?.name || null,
          bidderEmail: bidderInfo?.email || null,
          bidderPhone: bidderInfo?.phone || null,
          soldToName: soldToInfo?.name || null,
          soldToEmail: soldToInfo?.email || null,
          totalBids: bidCount[0].count,
        };
      }),
    );

    return itemsWithBids;
  } catch (dbError) {
    console.error("Database error:", dbError);
    throw new Error(
      `Failed to fetch items with bids: ${dbError instanceof Error ? dbError.message : "Unknown error"}`,
    );
  }
}
