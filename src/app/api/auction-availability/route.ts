import { database } from "@/db/database";
import { items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, isAvailable } = body;

    if (!itemId || typeof isAvailable !== "boolean") {
      return NextResponse.json(
        { error: "Missing itemId or isAvailable" },
        { status: 400 },
      );
    }

    await database
      .update(items)
      .set({
        isAvailable: isAvailable,
      })
      .where(eq(items.id, parseInt(itemId)));

    await pusherServer.trigger(`item-${itemId}`, "availability-changed", {
      isAvailable: isAvailable,
      itemId: itemId,
    });

    return NextResponse.json({
      success: true,
      itemId: itemId,
      isAvailable: isAvailable,
    });
  } catch {
    console.error("Error updating auction availability:", Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
