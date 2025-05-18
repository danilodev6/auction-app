"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { supabase, BUCKET_NAME } from "@/lib/supabase";

export async function CreateItemAction(formData: FormData) {
  const session = await auth();

  if (!session) {
    throw new Error("You must be signed in to create an item");
  }

  const user = session.user;

  if (!user || !user.id) {
    throw new Error("You must be signed in to create an item");
  }

  const rawPrice = formData.get("startingPrice") as string;
  const startingPrice = Math.round(parseFloat(rawPrice) * 100); // save as cents
  const name = formData.get("name") as string;
  const file = formData.get("file") as File;

  let imageURL = ""; // Changed to match schema column name (imageURL instead of imageUrl)

  if (file && file.size > 0) {
    try {
      // Create a unique file name
      const fileExtension = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExtension}`;
      const filePath = `${user.id}/${fileName}`;

      // Skip bucket verification - we'll create it manually in the Supabase dashboard
      console.log(`Attempting to upload file to ${BUCKET_NAME}/${filePath}`);

      // Upload the file to Supabase Storage
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

      // Get the public URL of the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

      console.log("Public URL:", publicUrl);
      imageURL = publicUrl; // Changed to match schema column name
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(
        `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  try {
    // Insert into database with corrected column name
    await database.insert(items).values({
      name,
      startingPrice,
      userId: user.id,
      imageURL: imageURL || null, // Changed to match schema column name
    });

    console.log("Item created successfully in database");
    revalidatePath("/");
  } catch (dbError) {
    console.error("Database error:", dbError);
    throw new Error(
      `Failed to create item in database: ${dbError instanceof Error ? dbError.message : "Unknown error"}`,
    );
  }
}
