import { database } from "@/db/database";
import { bids } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
  }

  // Fix: Use a different variable name to avoid conflict with the table name
  const itemBids = await database.query.bids.findMany({
    where: eq(bids.itemId, parseInt(itemId)),
    with: {
      users: true,
    },
    orderBy: (bids, { desc }) => [desc(bids.timestamp)],
  });

  return NextResponse.json(itemBids);
}
