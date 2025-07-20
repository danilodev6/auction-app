"use server";

import { auth, isAdmin } from "@/auth";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { supabase, BUCKET_NAME } from "@/lib/supabase";
import { pusherServer } from "@/lib/pusher-server";
import { Item, ItemUpdate } from "@/types/items";

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
      auctionType: auctionType as "live" | "regular",
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

export async function GetItemsCountAction(): Promise<number> {
  const session = await auth();
  if (!session || !(await isAdmin(session))) {
    throw new Error("You must be an admin to view items count");
  }

  try {
    const result = await database.execute(sql`
      SELECT COUNT(*) as count FROM aa_items
    `);

    const row = result[0] as Record<string, unknown>;
    const count = row.count;

    if (typeof count !== "number") {
      throw new Error("Invalid count result from database");
    }

    return count;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error(
      `Failed to fetch items count: ${error instanceof Error ? error.message : "Unknown error"}`,
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

    let updatedItem = null;

    if (!item.isFeatured) {
      // Unfeature all others
      await database
        .update(items)
        .set({ isFeatured: false })
        .where(eq(items.auctionType, "live"));

      // Feature this item
      await database
        .update(items)
        .set({ isFeatured: true })
        .where(eq(items.id, itemId));

      updatedItem = await database
        .select()
        .from(items)
        .where(eq(items.id, itemId))
        .limit(1);
    } else {
      // Unfeature this item
      await database
        .update(items)
        .set({ isFeatured: false })
        .where(eq(items.id, itemId));

      updatedItem = [{ ...item, isFeatured: false }];
    }

    // Push to clients
    if (updatedItem[0]) {
      await pusherServer.trigger("live-auction", "featured-changed", {
        item: updatedItem[0],
      });
    }

    // Revalidate paths
    revalidatePath("/");
    revalidatePath("/live");
    revalidatePath("/items/manage");
  } catch (dbError) {
    console.error("Database error:", dbError);
    throw new Error(
      `Failed to toggle featured status: ${
        dbError instanceof Error ? dbError.message : "Unknown error"
      }`,
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

export async function GetAllItemsWithBidsAction(
  page: number = 1,
  pageSize: number = 10,
): Promise<Item[]> {
  const session = await auth();
  if (!session || !(await isAdmin(session))) {
    throw new Error("You must be an admin to view all items");
  }

  try {
    const offset = (page - 1) * pageSize;

    const result = await database.execute(sql`
      SELECT 
        i.*,
        b.amount AS "currentBid",
        b.timestamp AS "bidTime",
        u.name AS "bidderName",
        u.email AS "bidderEmail",
        u.phone AS "bidderPhone",
        sold.name AS "soldToName",
        sold.email AS "soldToEmail",
        sold.phone AS "soldToPhone",
        bid_counts.total_bids AS "totalBids"
      FROM aa_items i
      LEFT JOIN (
        SELECT DISTINCT ON ("itemId") *
        FROM aa_bids
        ORDER BY "itemId", timestamp DESC
      ) b ON b."itemId" = i.id
      LEFT JOIN (
        SELECT "itemId", COUNT(*) AS total_bids
        FROM aa_bids
        GROUP BY "itemId"
      ) bid_counts ON bid_counts."itemId" = i.id
      LEFT JOIN aa_user u ON b."userId" = u.id
      LEFT JOIN aa_user sold ON i."soldTo" = sold.id
      ORDER BY i.id ASC
      LIMIT ${pageSize}
      OFFSET ${offset};
    `);

    return result as unknown as Item[];
  } catch (error) {
    console.error("Database error:", error);
    throw new Error(
      `Failed to fetch items with bids: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// export async function GetAllItemsWithBidsAction() {
//   const session = await auth();
//   if (!session || !(await isAdmin(session))) {
//     throw new Error("You must be an admin to view all items");
//   }
//
//   try {
//     const result = await database.execute(sql`
//       SELECT
//         i.*,
//         b.amount AS "currentBid",
//         b.timestamp AS "bidTime",
//         u.name AS "bidderName",
//         u.email AS "bidderEmail",
//         u.phone AS "bidderPhone",
//         sold.name AS "soldToName",
//         sold.email AS "soldToEmail",
//         sold.phone AS "soldToPhone",
//         bid_counts.total_bids AS "totalBids"
//       FROM aa_items i
//       LEFT JOIN (
//         SELECT DISTINCT ON ("itemId") *
//         FROM aa_bids
//         ORDER BY "itemId", timestamp DESC
//       ) b ON b."itemId" = i.id
//       LEFT JOIN (
//         SELECT "itemId", COUNT(*) AS total_bids
//         FROM aa_bids
//         GROUP BY "itemId"
//       ) bid_counts ON bid_counts."itemId" = i.id
//       LEFT JOIN aa_user u ON b."userId" = u.id
//       LEFT JOIN aa_user sold ON i."soldTo" = sold.id
//       ORDER BY i.id ASC;
//     `);
//
//     return result;
//   } catch (error) {
//     console.error("Database error:", error);
//     throw new Error(
//       `Failed to fetch items with bids: ${error instanceof Error ? error.message : "Unknown error"}`,
//     );
//   }
// }

// export async function GetAllItemsWithBidsAction() {
//   const session = await auth();
//
//   if (!session) {
//     throw new Error("You must be signed in to view items");
//   }
//
//   if (!(await isAdmin(session))) {
//     throw new Error("You must be an admin to view all items");
//   }
//
//   try {
//     // First get all items
//     const allItems = await database.select().from(items);
//
//     // Then for each item, get the latest bid info
//     const itemsWithBids = await Promise.all(
//       allItems.map(async (item) => {
//         // Get the latest bid for this item
//         const latestBid = await database
//           .select({
//             amount: bids.amount,
//             userId: bids.userId,
//             timestamp: bids.timestamp,
//           })
//           .from(bids)
//           .where(eq(bids.itemId, item.id))
//           .orderBy(desc(bids.timestamp))
//           .limit(1);
//
//         // Get total bid count for this item
//         const bidCount = await database
//           .select({ count: count() })
//           .from(bids)
//           .where(eq(bids.itemId, item.id));
//
//         let bidderInfo = null;
//         if (latestBid.length > 0) {
//           // Get bidder information
//           const bidder = await database
//             .select({
//               name: users.name,
//               email: users.email,
//               phone: users.phone,
//             })
//             .from(users)
//             .where(eq(users.id, latestBid[0].userId))
//             .limit(1);
//
//           bidderInfo = bidder.length > 0 ? bidder[0] : null;
//         }
//
//         let soldToInfo = null;
//         if (item.auctionType === "direct" && item.soldTo) {
//           const soldToUser = await database
//             .select({
//               name: users.name,
//               email: users.email,
//               phone: users.phone,
//             })
//             .from(users)
//             .where(eq(users.id, item.soldTo))
//             .limit(1);
//
//           soldToInfo = soldToUser.length > 0 ? soldToUser[0] : null;
//         }
//
//         return {
//           ...item,
//           currentBid: latestBid.length > 0 ? latestBid[0].amount : null,
//           bidTime: latestBid.length > 0 ? latestBid[0].timestamp : null,
//           bidderName: bidderInfo?.name || null,
//           bidderEmail: bidderInfo?.email || null,
//           bidderPhone: bidderInfo?.phone || null,
//           soldToName: soldToInfo?.name || null,
//           soldToEmail: soldToInfo?.email || null,
//           soldToPhone: soldToInfo?.phone || null,
//           totalBids: bidCount[0].count,
//         };
//       }),
//     );
//
//     return itemsWithBids;
//   } catch (dbError) {
//     console.error("Database error:", dbError);
//     throw new Error(
//       `Failed to fetch items with bids: ${dbError instanceof Error ? dbError.message : "Unknown error"}`,
//     );
//   }
// }
