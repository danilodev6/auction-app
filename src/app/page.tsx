import { ItemCard } from "@/components/ItemCard";
import { database } from "@/db/database";
import { items } from "@/db/schema";

export default async function HomePage() {
  const allItems = await database.select().from(items);

  const regularItems = allItems.filter(
    (item) => item.auctionType === "regular",
  );

  const directItems = allItems.filter((item) => item.auctionType === "direct");

  return (
    <main className="container flex flex-col place-items-center">
      <h1 className="text-3xl font-bold mx-4 my-3">Subastas regulares</h1>
      {regularItems.length === 0 && (
        <p className="text-gray-500 m-4">
          No hay items en subasta regular en este momento
        </p>
      )}
      <div className="w-full flex justify-center">
        <div className="grid gap-4 max-w-6xl px-4">
          {regularItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
      <h2 className="text-2xl font-bold mx-4 my-3">Venta directa</h2>
      {directItems.length === 0 && (
        <p className="text-gray-500 m-4">
          No hay items en venta directa en este momento
        </p>
      )}
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl w-full px-4">
          {directItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </main>
  );
}
