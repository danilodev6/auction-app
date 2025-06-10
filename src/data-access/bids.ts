import { eq, desc } from "drizzle-orm";
import { database } from "@/db/database";
import { bids } from "@/db/schema";

export async function getBids(itemId: number) {
  const allBids = await database.query.bids.findMany({
    where: eq(bids.itemId, itemId),
    orderBy: desc(bids.timestamp),
    with: {
      users: {
        columns: {
          image: true,
          name: true,
        },
      },
    },
  });
  return allBids;
}
