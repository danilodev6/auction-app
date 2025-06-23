import { ItemCard } from "@/components/ItemCard";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import { FeaturedIndicatorSign } from "@/components/FeaturedIndicatorSign";
import { auth, isAdmin } from "@/auth";
import { settings } from "@/db/schema";
import { ItemCarousel } from "@/components/ItemCarousel";

export default async function HomePage() {
  const session = await auth();
  const userIsAdmin = await isAdmin(session);

  const allItems = await database.select().from(items);

  const setting = await database
    .select()
    .from(settings)
    .limit(1)
    .then((r) => r[0]);
  const nextLive = setting?.nextLive?.toISOString() ?? null;

  const regularItems = allItems.filter(
    (item) => item.auctionType === "regular",
  );

  const directItems = allItems.filter((item) => item.auctionType === "direct");

  return (
    <main className="container flex flex-col place-items-center">
      <h1 className="text-3xl font-bold mx-4 mb-2">Subastas regulares</h1>
      {regularItems.length === 0 && (
        <p className="text-gray-500 m-4">
          No hay items en subasta regular en este momento
        </p>
      )}

      <ItemCarousel items={regularItems} />

      <h2 className="text-2xl font-bold mx-4 mt-3 mb-2">Venta directa</h2>
      {directItems.length === 0 && (
        <p className="text-gray-500 m-4">
          No hay items en venta directa en este momento
        </p>
      )}
      <ItemCarousel items={directItems} />
      {/* <div className="w-full flex justify-center"> */}
      {/*   <div className="flex flex-wrap justify-center gap-4 max-w-6xl px-4"> */}
      {/*     {directItems.map((item) => ( */}
      {/*       <ItemCard key={item.id} item={item} /> */}
      {/*     ))} */}
      {/*   </div> */}
      {/* </div> */}
      <FeaturedIndicatorSign userIsAdmin={userIsAdmin} initialDate={nextLive} />
    </main>
  );
}
