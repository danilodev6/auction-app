import { getAllItems } from "@/data-access/items";
import { getBids } from "@/data-access/bids";
import { formatToDollar } from "@/util/currency";
import Image from "next/image";
import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { Button } from "@/components/ui/button";
import { createBidAction } from "@/app/items/[itemId]/actions";
import AuctionSelector from "@/components/AuctionSelector";
import ChatBox from "@/components/ChatBox";
import { auth } from "@/auth";
import { ADMINS } from "@/auth";

export default async function LivePage({
  searchParams,
}: {
  searchParams?: { item?: string };
}) {
  const session = await auth();
  const isAdmin = ADMINS.includes(session?.user?.email ?? "");
  const isSignedIn = !!session?.user?.id;

  const allItems = await getAllItems();

  // Filter items for live streaming (only live and draft)
  const liveItems = allItems.filter(
    (item) => item.auctionType === "live" || item.auctionType === "draft",
  );

  const selectedId = searchParams?.item ? Number(searchParams.item) : null;

  // Find selected item only from live items
  const selectedItem = selectedId
    ? liveItems.find((item) => item.id === selectedId)
    : null;

  // Get bids only if there's a selected item
  const bids = selectedItem ? await getBids(selectedItem.id) : [];
  const latestBids = bids.reverse().slice(-6).reverse();

  const isExpired = selectedItem
    ? new Date(selectedItem.bidEndTime) < new Date()
    : false;

  return (
    <main className="flex flex-col w-full lg:flex-row gap-6 py-6">
      {/* Left: Item selection and chat */}
      <div className="lg:w-1/4 p-4 border-r">
        {isAdmin && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Auction Control</h2>
            <AuctionSelector items={liveItems} selectedId={selectedItem?.id} />

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
          </div>
        )}
        {selectedId ? (
          <ChatBox />
        ) : (
          <p>Chat will be able during Live Auction</p>
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

        {selectedItem ? (
          <div className="bg-gray-100 rounded-lg m-4 p-4 mb-4">
            <p className="font-semibold">Current Auction:</p>
            <p className="text-lg">{selectedItem.name}</p>
            <p className="font-semibold mt-2">Description:</p>
            <p>{selectedItem.description}</p>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg m-4 p-4 mb-4">
            <p className="text-center text-gray-600">
              No auction currently selected for streaming
            </p>
            {isAdmin && liveItems.length > 0 && (
              <p className="text-center text-sm text-gray-500 mt-2">
                Use the auction selector to choose an item to feature
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right: Item details (only show if item is selected) */}
      {selectedItem ? (
        <>
          <div className="lg:w-1/4 p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold">{selectedItem.name}</h1>
              <form action={createBidAction.bind(null, selectedItem.id)}>
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
              <Countdown endTime={selectedItem.bidEndTime} />
            </div>

            {selectedItem.imageURL && (
              <Image
                src={selectedItem.imageURL}
                alt={selectedItem.name}
                width={200}
                height={200}
                className="rounded-lg mb-4 mx-auto"
              />
            )}

            <div className="flex flex-col gap-3 mb-4 items-center">
              <DetailCard
                label="Current Bid"
                value={formatToDollar(selectedItem.currentBid)}
              />
              <DetailCard
                label="Starting Price"
                value={formatToDollar(selectedItem.startingPrice)}
              />
              <DetailCard
                label="Bid Interval"
                value={formatToDollar(selectedItem.bidInterval)}
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
        /* Show placeholder when no item selected */
        <div className="lg:w-1/2 p-4 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Image
              src="/auction.svg"
              alt="No auction selected"
              width={200}
              height={200}
              className="mx-auto mb-4 opacity-50"
            />
            <p className="text-lg">No auction currently featured</p>
            {isAdmin && (
              <p className="text-sm mt-2">
                Select an auction from the control panel to display it here
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
