import { database } from "@/db/database";
import { eq } from "drizzle-orm";
import { items } from "@/db/schema";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistance } from "date-fns";
import { formatToDollar } from "@/util/currency";

export function formatDate(date: Date) {
  return formatDistance(date, new Date(), {
    addSuffix: true,
    includeSeconds: true,
  });
}

export default async function ItemPage({
  params: { itemId },
}: {
  params: { itemId: string };
}) {
  const item = await database.query.items.findFirst({
    where: eq(items.id, parseInt(itemId)),
  });

  if (!item) {
    return (
      <div className="container flex flex-col items-center mx-auto py-12">
        <h1 className="text-3xl font-bold">Not item founded</h1>
        <p className="mt-4">
          The item your are trying to view doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/" className="mt-4">
            View Items
          </Link>
        </Button>
        <Image
          className="mt-8 mx-auto"
          src="/package.svg"
          alt="Empty State"
          width={500}
          height={500}
        />
      </div>
    );
  }

  const bids = [
    {
      id: 1,
      amount: 100,
      user: { name: "John Doe" },
      time: new Date(),
    },
    {
      id: 2,
      amount: 200,
      user: { name: "Jane Doe" },
      time: new Date(),
    },
    {
      id: 3,
      amount: 300,
      user: { name: "John Smith" },
      time: new Date(),
    },
  ];

  // const bids = [];

  const hasBids = bids.length > 0;

  if (item?.imageURL != null) {
    return (
      <main className="container mx-auto py-10">
        <h1 className="text-3xl font-bold text-center mb-10">{item?.name}</h1>
        <div className="flex gap-28 w-full justify-center">
          <div>
            <p className="text-2xl font-bold">Details</p>
            <Image
              className="rounded-xl mt-4"
              src={item?.imageURL}
              alt={item?.name}
              width={350}
              height={350}
            />
            <div className="mt-4 bg-gray-100 rounded-lg p-4">
              Starting price:{" "}
              <span className="font-bold">
                $ {formatToDollar(item.startingPrice)}
              </span>
            </div>
            <div className="mt-4 bg-gray-100 rounded-lg p-4">
              Bid Interval:{" "}
              <span className="font-bold">
                $ {formatToDollar(item.bidInterval)}
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Current bids</h2>
            {hasBids ? (
              <div className="bg-gray-100 rounded-lg p-4 mt-4">
                <ul className="flex flex-col gap-3">
                  {bids.map((bid) => (
                    <li
                      key={bid.id}
                      className="flex w-max justify-between items-center py-3 bg-white rounded-lg px-4"
                    >
                      <div>
                        <span className="font-bold">$ {bid.amount}</span>{" "}
                        {" by "}
                        <span className="font-bold">{bid.user.name}</span>{" "}
                        {" => "}
                        <span>{formatDate(bid.time)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-4 mt-4">
                <p className="text=xl w-full">No bids yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }
}
