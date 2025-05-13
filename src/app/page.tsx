import { database } from "@/db/database";
import { items } from "@/db/schema";

export default async function HomePage() {
  const allItems = await database.select().from(items);

  return (
    <main className="container mx-auto py-12">
      <h1 className="text-3xl font-bold">Auction</h1>
      <h2 className="text-2xl font-bold">All items</h2>
      <div className="grid grid-cols-4 my-4 gap-4">
        {allItems.map((item) => (
          <div key={item.id} className="border p-8 rounded-xl">
            {item.name}
            <br />
            Starting Price: $ {item.startingPrice / 100}
          </div>
        ))}
      </div>
    </main>
  );
}
