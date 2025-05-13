"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function CreateItemAction(formData: FormData) {
  const session = await auth();

  if (!session) {
    throw new Error("You must be signed in to create an item");
  }

  const user = session.user;

  if (!user) {
    throw new Error("You must be signed in to create an item");
  }

  const rawPrice = formData.get("startingPrice") as string;
  const startingPrice = Math.round(parseFloat(rawPrice) * 100); // save as cents

  await database.insert(items).values({
    name: formData.get("name") as string,
    startingPrice,
    userId: session?.user?.id as string,
  });
  revalidatePath("/");
}
