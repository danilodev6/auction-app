import { database } from "@/db/database";
import { items } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function FeaturedIndicator() {
  try {
    // Check if there's any featured live item
    const featuredItem = await database
      .select({ id: items.id })
      .from(items)
      .where(and(eq(items.isFeatured, true), eq(items.auctionType, "live")))
      .limit(1);

    if (featuredItem.length === 0) {
      return null;
    }

    return (
      <>
        <div className="absolute top-1.5 -right-3.5 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      </>
    );
  } catch (error) {
    console.error("Error checking featured items:", error);
    return null;
  }
}
