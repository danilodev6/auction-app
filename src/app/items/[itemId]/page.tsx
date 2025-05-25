import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistance } from "date-fns";
import { formatToDollar } from "@/util/currency";
import { createBidAction } from "./actions";
import { getBids } from "@/data-access/bids";
import { getItem } from "@/data-access/items";

export function formatDate(date: Date) {
  return formatDistance(date, new Date(), {
    addSuffix: true,
    includeSeconds: true,
  });
}

export default async function ItemPage({
  params,
}: {
  params: { itemId: string };
}) {
  const { itemId } = params;

  const item = await getItem(parseInt(itemId));

  if (!item) {
    return (
      <div className="container flex flex-col items-center mx-auto py-12">
        <h1 className="text-4xl font-bold">Not item founded</h1>
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

  const allBids = await getBids(item.id);

  const hasBids = allBids.length > 0;

  if (item?.imageURL != null) {
    return (
      <main className="container mx-auto py-2">
        <h1 className="text-4xl font-bold text-center mb-10">{item?.name}</h1>
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
            <div className="mt-3 bg-gray-100 rounded-lg p-4">
              Current Bid:{" "}
              <span className="font-bold">
                $ {formatToDollar(item.currentBid)}
              </span>
            </div>

            <div className="mt-3 bg-gray-100 rounded-lg p-4">
              Starting price:{" "}
              <span className="font-bold">
                $ {formatToDollar(item.startingPrice)}
              </span>
            </div>
            <div className="mt-3 bg-gray-100 rounded-lg p-4">
              Bid Interval:{" "}
              <span className="font-bold">
                $ {formatToDollar(item.bidInterval)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex gap-6 items-center">
              <h2 className="text-2xl font-bold">Current bids</h2>
              <form action={createBidAction.bind(null, item.id)}>
                <Button>Place a bid</Button>
              </form>
            </div>

            {hasBids ? (
              <div className="bg-gray-100 rounded-lg p-4 mt-4">
                <ul className="flex flex-col gap-3">
                  {allBids.map((bid) => (
                    <li
                      key={bid.id}
                      className="flex w-full justify-between items-center py-3 bg-white rounded-lg px-4"
                    >
                      <div>
                        <span className="font-bold">
                          $ {formatToDollar(bid.amount)}
                        </span>{" "}
                        {" by "}
                        <span className="font-bold">{bid.users.name}</span>{" "}
                        {" => "}
                        <span>{formatDate(bid.timestamp)}</span>
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
