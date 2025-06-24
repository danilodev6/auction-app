import { database } from "@/db/database";
import { ItemCard } from "@/components/ItemCard";
import { items } from "@/db/schema";

export default async function directSale() {
  const allItems = await database.select().from(items);

  const directItems = allItems.filter((item) => item.auctionType === "direct");

  return (
    <main className="container flex flex-col place-items-center">
      <h2 className="text-2xl font-bold mx-4 mt-3 mb-2">Venta directa</h2>
      {directItems.length === 0 && (
        <p className="text-gray-500 m-4">
          No hay items en venta directa en este momento
        </p>
      )}
      <div className="w-full flex justify-center">
        <div className="flex flex-wrap justify-center gap-4 max-w-6xl px-4">
          {directItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </main>
  );
}
