"use server";

import { auth, isAdmin } from "@/auth";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { supabase, BUCKET_NAME } from "@/lib/supabase";

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
    const updateData: any = {
      name,
      description,
      startingPrice: parseInt(startingPrice),
      bidInterval: parseInt(bidInterval),
      bidEndTime: new Date(bidEndTime || Date.now()),
      auctionType: auctionType || "regular",
    };

    // Only update imageURL if a new image was uploaded
    if (imageURL) {
      updateData.imageURL = imageURL;
    }

    await database.update(items).set(updateData).where(eq(items.id, itemId));

    console.log("Item updated successfully in database");
    revalidatePath("/");
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
