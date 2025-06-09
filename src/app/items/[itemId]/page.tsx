import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistance } from "date-fns";
import { formatToDollar } from "@/util/currency";
import { createBidAction } from "./actions";
import { getBids } from "@/data-access/bids";
import { getItem } from "@/data-access/items";
import { Countdown } from "@/components/Countdown";
import { auth } from "@/auth";

function formatDate(dateInput: string) {
  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) return "Invalid date";
  return formatDistance(parsed, new Date(), {
    addSuffix: true,
    includeSeconds: true,
  });
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;

  const session = await auth();

  const item = await getItem(parseInt(itemId));

  const isExpired = new Date(item?.bidEndTime) < new Date();
  const isSignedIn = !!session?.user?.id;

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
      <main className="mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10">{item?.name}</h1>
        <div className="flex gap-28 w-full justify-center">
          <div>
            <p className="text-2xl font-bold">Details</p>
            <Image
              className="m-auto rounded-xl border-2"
              src={item?.imageURL}
              alt={item?.name}
              width={300}
              height={300}
            />

            <div className="grid grid-cols-2 gap-4 ">
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
              <div className="mt-3 bg-gray-100 rounded-lg p-4">
                Auction Ends:{" "}
                <span className="font-bold">
                  {formatDate(new Date(item.bidEndTime))}
                </span>
              </div>
            </div>
            <div className="mt-3 bg-gray-100 rounded-lg p-4">
              Description: <br />
              <span className="font-bold">{item.description}</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex gap-6 items-center">
              <h2 className="text-2xl font-bold">Current bids</h2>
              <form action={createBidAction.bind(null, item.id)}>
                <Button disabled={isExpired || !isSignedIn}>Place a bid</Button>
              </form>
            </div>
            <div className="mt-3 bg-gray-100 rounded-lg p-4">
              Time Left: <Countdown endTime={item.bidEndTime} />
            </div>

            {hasBids ? (
              <div className="bg-gray-100 rounded-lg p-4 mt-4">
                <ul className="flex flex-col gap-3">
                  {[...allBids]
                    .reverse()
                    .slice(-3)
                    .reverse()
                    .map((bid) => (
                      <li
                        key={bid.id}
                        className="flex w-full justify-between items-center py-3 bg-white rounded-lg px-4"
                      >
                        <div>
                          <span className="font-bold">
                            $ {formatToDollar(bid.amount)}
                          </span>{" "}
                          {" by "}
                          <span className="font-bold">
                            {bid.users.name}
                          </span>{" "}
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
