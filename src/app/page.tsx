import { ItemCard } from "@/components/ItemCard";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import { EmptyState } from "./EmptyState";

export default async function HomePage() {
  const allItems = await database.select().from(items);

  const regularItems = allItems.filter(
    (item) => item.auctionType === "regular",
  );

  const liveItems = allItems.filter((item) => item.auctionType === "live");

  const hasItems = regularItems.length > 0;

  return (
    <main className="container">
      <h1 className="text-3xl font-bold m-4">Subastas regulares</h1>
      {hasItems ? (
        <>
          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(100px,250px))] gap-4">
            {regularItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          <h2 className="text-2xl font-bold m-4">Venta directa</h2>
          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(100px,250px))] gap-4">
            {liveItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState />
      )}
    </main>
  );
}
