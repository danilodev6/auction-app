import { database } from "@/db/database";
import { items } from "@/db/schema";
import { FeaturedIndicatorSign } from "@/components/FeaturedIndicatorSign";
import { auth, isAdmin } from "@/auth";
import { settings } from "@/db/schema";
import { ItemCarousel } from "@/components/ItemCarousel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { requireNotBlocked } from "@/lib/auth-helpers";

export default async function HomePage() {
  const session = await auth();
  await requireNotBlocked();
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
      <div className="relative flex place-items-center animate-fade-in delay-200">
        <h1 className="text-3xl font-bold mx-4 mb-2">Subastas virtuales</h1>
        <Link href="/reg-auct" className="absolute -right-13">
          <Button size={"sm"} className="text-xs">
            ver todo
          </Button>
        </Link>
      </div>
      {regularItems.length === 0 && (
        <p className="text-gray-500 m-4">
          No hay items en subasta en este momento
        </p>
      )}

      <ItemCarousel items={regularItems} />

      <div className="flex relative place-items-center mt-3 animate-fade-in delay-200">
        <h2 className="text-3xl font-bold mx-4 mb-2">Venta directa</h2>
        <Link href="/direct" className="absolute -right-13">
          <Button size={"sm"} className="text-xs">
            ver todo
          </Button>
        </Link>
      </div>
      {directItems.length === 0 && (
        <p className="text-gray-500 m-4">
          No hay items en venta en este momento
        </p>
      )}
      <ItemCarousel items={directItems} />

      <FeaturedIndicatorSign userIsAdmin={userIsAdmin} initialDate={nextLive} />
    </main>
  );
}
