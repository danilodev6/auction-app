import { ItemCard } from "@/components/ItemCard";
import { database } from "@/db/database";
import { items } from "@/db/schema";

export default async function HomePage() {
  const allItems = await database.select().from(items);

  const regularItems = allItems.filter(
    (item) => item.auctionType === "regular",
  );

  const directItems = allItems.filter((item) => item.auctionType === "direct");

  // const hasItems = regularItems.length > 0;

  return (
    <main className="container">
      <h1 className="text-3xl font-bold m-4">Subastas regulares</h1>
      {regularItems.length === 0 && (
        <p className="text-gray-500 m-4">
          No hay items en subasta regular en este momento
        </p>
      )}
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(100px,250px))] gap-4">
        {regularItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
      <h2 className="text-2xl font-bold m-4">Venta directa</h2>
      {directItems.length === 0 && (
        <p className="text-gray-500 m-4">
          No hay items en venta directa en este momento
        </p>
      )}
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(100px,250px))] gap-4">
        {directItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}
