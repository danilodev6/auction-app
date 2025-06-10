import { database } from "@/db/database";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
  }

  const bids = await database.query.bids.findMany({
    where: eq(bids.itemId, parseInt(itemId)),
    with: {
      users: true,
    },
    orderBy: (bids, { desc }) => [desc(bids.timestamp)],
  });

  return NextResponse.json(bids);
}
