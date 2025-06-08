import { getAllItems } from "@/data-access/items";
import { getBids } from "@/data-access/bids";
import { formatToDollar } from "@/util/currency";
import Image from "next/image";
import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { Button } from "@/components/ui/button";
import { createBidAction } from "@/app/items/[itemId]/actions";
import ChatBox from "@/components/ChatBox";
import { auth } from "@/auth";
import { ADMINS } from "@/auth";

export default async function LivePage() {
  const session = await auth();
  const isAdmin = ADMINS.includes(session?.user?.email ?? "");
  const isSignedIn = !!session?.user?.id;

  const allItems = await getAllItems();

  // Filter items for live streaming (only live and draft)
  const liveItems = allItems.filter((item) => item.auctionType === "live");

  // Find the featured item automatically
  const featuredItem = liveItems.find((item) => item.isFeatured);

  // Get bids only if there's a featured item
  const bids = featuredItem ? await getBids(featuredItem.id) : [];
  const latestBids = bids.reverse().slice(-6).reverse();

  const isExpired = featuredItem
    ? new Date(featuredItem.bidEndTime) < new Date()
    : false;

  return (
    <main className="flex flex-col w-full lg:flex-row gap-6">
      {/* Left: Chat section */}
      <div className="lg:w-1/4 p-4 border-r">
        {isAdmin && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Live Auction Status</h2>

            {liveItems.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  No live or draft auctions available.{" "}
                  <Link href="/items/create" className="underline">
                    Create one
                  </Link>{" "}
                  or{" "}
                  <Link href="/items/manage" className="underline">
                    manage existing items
                  </Link>
                  .
                </p>
              </div>
            )}

            {liveItems.length > 0 && !featuredItem && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  You have {liveItems.length} live auction(s) but none are
                  featured.{" "}
                  <Link href="/items/manage" className="underline">
                    Feature an item
                  </Link>{" "}
                  to display it on the live stream.
                </p>
              </div>
            )}

            {featuredItem && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  ✅ Currently featuring: <strong>{featuredItem.name}</strong>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  <Link href="/items/manage" className="underline">
                    Manage items
                  </Link>{" "}
                  to change featured auction
                </p>
              </div>
            )}
          </div>
        )}

        {featuredItem ? (
          <ChatBox />
        ) : (
          <p className="text-gray-600">
            Chat will be available during Live Auction
          </p>
        )}
      </div>

      {/* Middle: Twitch Stream */}
      <div className="lg:w-4/4 p-4">
        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
          <iframe
            src={`https://player.twitch.tv/?channel=rubius&parent=localhost`}
            width="100%"
            height="100%"
            allowFullScreen
          />
        </div>

        {featuredItem ? (
          <div className="bg-gray-100 rounded-lg m-4 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                🔴 LIVE
              </span>
              <p className="font-semibold">Current Auction:</p>
              <p className="text-lg font-bold">{featuredItem.name}</p>
            </div>
            <p className="font-semibold mt-2">Description:</p>
            <p>{featuredItem.description}</p>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg m-4 p-4 mb-4">
            <p className="text-center text-gray-600">
              No auction currently featured for streaming
            </p>
            {isAdmin && liveItems.length > 0 && (
              <p className="text-center text-sm text-gray-500 mt-2">
                <Link href="/items/manage" className="underline">
                  Feature a live auction
                </Link>{" "}
                to display it here
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right: Item details (only show if item is featured) */}
      {featuredItem ? (
        <>
          <div className="lg:w-1/4 p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold">{featuredItem.name}</h1>
              <form action={createBidAction.bind(null, featuredItem.id)}>
                <Button size="sm" disabled={isExpired || !isSignedIn}>
                  {!isSignedIn
                    ? "Sign In to Bid"
                    : isExpired
                      ? "Auction Ended"
                      : "Place Bid"}
                </Button>
              </form>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-semibold">Time Left:</p>
              <Countdown endTime={featuredItem.bidEndTime} />
            </div>

            {featuredItem.imageURL && (
              <Image
                src={featuredItem.imageURL}
                alt={featuredItem.name}
                width={200}
                height={200}
                className="rounded-lg mb-4 mx-auto"
              />
            )}

            <div className="flex flex-col gap-3 mb-4 items-center">
              <DetailCard
                label="Current Bid"
                value={formatToDollar(featuredItem.currentBid)}
              />
              <DetailCard
                label="Starting Price"
                value={formatToDollar(featuredItem.startingPrice)}
              />
              <DetailCard
                label="Bid Interval"
                value={formatToDollar(featuredItem.bidInterval)}
              />
            </div>
          </div>

          {/* Bids */}
          <div className="lg:w-1/4 p-4">
            <h3 className="font-bold mb-2">Latest Bids</h3>
            {latestBids.length > 0 ? (
              <div className="space-y-2">
                {latestBids.map((bid) => (
                  <div key={bid.id} className="bg-white p-3 rounded-lg border">
                    <p className="font-bold">${formatToDollar(bid.amount)}</p>
                    <p className="text-sm">by {bid.users.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(bid.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No bids yet</p>
            )}
          </div>
        </>
      ) : (
        /* Show placeholder when no item featured */
        <div className="lg:w-1/2 p-4 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Image
              src="/auction.svg"
              alt="No auction featured"
              width={200}
              height={200}
              className="mx-auto mb-4 opacity-50"
            />
            <p className="text-lg">No auction currently featured</p>
            {isAdmin && (
              <p className="text-sm mt-2">
                <Link href="/items/manage" className="underline">
                  Feature a live auction
                </Link>{" "}
                to display it on the stream
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="w-full mx-auto bg-gray-100 rounded-lg p-3">
      <p className="text-sm font-semibold text-center">{label}</p>
      <p className="text-center">$ {value}</p>
    </div>
  );
}
