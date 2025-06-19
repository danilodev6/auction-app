"use server";

import { auth, isAdmin } from "@/auth";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { supabase, BUCKET_NAME } from "@/lib/supabase";

export async function CreateItemAction(formData: FormData) {
  const session = await auth();

  if (!session) {
    throw new Error("You must be signed in to create an item");
  }

  if (!(await isAdmin(session))) {
    throw new Error("You must be an admin to create an item");
  }

  const user = session.user;

  if (!user || !user.id) {
    throw new Error("You must be signed in to create an item");
  }

  const startingPrice = formData.get("startingPrice") as string;
  const name = formData.get("name") as string;
  const file = formData.get("file") as File;
  const description = formData.get("description") as string;
  const bidInterval = formData.get("bidInterval") as string;
  const bidEndTime = formData.get("bidEndTime") as string;
  const auctionType = formData.get("auctionType") as string;
  const isFeatured = formData.get("isFeatured") === "true";

  let imageURL = "";

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

    await database.insert(items).values({
      name,
      description: description,
      startingPrice: parseInt(startingPrice),
      userId: user.id,
      imageURL: imageURL || null,
      bidInterval: parseInt(bidInterval),
      bidEndTime: new Date(bidEndTime || Date.now()),
      auctionType: auctionType || "regular",
      isFeatured: isFeatured && auctionType === "live", // Only allow featuring for live auctions
    });

    console.log("Item created successfully in database");
    revalidatePath("/");
    revalidatePath("/live");
    revalidatePath("/items/manage");
  } catch (dbError) {
    console.error("Database error:", dbError);
    throw new Error(
      `Failed to create item in database: ${dbError instanceof Error ? dbError.message : "Unknown error"}`,
    );
  }
}
