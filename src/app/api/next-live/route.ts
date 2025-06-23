import { NextResponse } from "next/server";
import { database } from "@/db/database";
import { settings } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { nextLive } = await req.json();

    // Clear existing date (assuming only one row)
    await database.delete(settings);

    // Only insert a new one if not null
    if (nextLive) {
      await database.insert(settings).values({
        nextLive: new Date(nextLive),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving next live date:", error);
    return new NextResponse("Failed to save date", { status: 500 });
  }
}
