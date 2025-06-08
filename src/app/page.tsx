import { ItemCard } from "@/components/ItemCard";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import { EmptyState } from "./EmptyState";

export default async function HomePage() {
  const allItems = await database.select().from(items);

  const regularItems = allItems.filter(
    (item) => item.auctionType === "regular",
  );

  const hasItems = regularItems.length > 0;

  return (
    <main className="container">
      <h1 className="text-3xl font-bold">Auction</h1>
      <h2 className="text-2xl font-bold">All items</h2>
      {hasItems ? (
        <div className="grid grid-cols-4 my-4 gap-4">
          <>
            {regularItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </>
        </div>
      ) : (
        <EmptyState />
      )}
    </main>
  );
}
