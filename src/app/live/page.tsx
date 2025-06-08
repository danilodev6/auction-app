import { getAllItems } from "@/data-access/items";
import { getBids } from "@/data-access/bids";
import { formatToDollar } from "@/util/currency";
import Image from "next/image";
import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { Button } from "@/components/ui/button";
import { createBidAction } from "@/app/items/[itemId]/actions";
import AuctionSelector from "@/components/AuctionSelector";
import { redirect } from "next/navigation";
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
  if (!allItems || allItems.length === 0) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-4xl font-bold">No Live Auctions</h1>
        <p className="mt-4">There are currently no active auctions.</p>
        <Button asChild className="mt-6">
          <Link href="/create">Create New Auction</Link>
        </Button>
        <Image
          className="mt-8 mx-auto"
          src="/auction.svg"
          alt="No auctions"
          width={400}
          height={400}
        />
      </div>
    );
  }

  const selectedId = Number(searchParams?.item);

  // If no item is selected or invalid ID, redirect to first item
  if (!selectedId || !allItems.find((item) => item.id === selectedId)) {
    const firstItemId = allItems[0]?.id;
    if (firstItemId) {
      redirect(`/live?item=${firstItemId}`);
    }
  }

  const selectedItem =
    allItems.find((item) => item.id === selectedId) || allItems[0];
  const bids = await getBids(selectedItem.id);
  const latestBids = bids.reverse().slice(-6).reverse();

  const isExpired = new Date(selectedItem.bidEndTime) < new Date();
  return (
    <main className="flex flex-col w-full lg:flex-row gap-6 py-6">
      {/* Left: Item selection */}
      <div className="lg:w-1/4 p-4 border-r">
        {isAdmin && (
          <div>
            <h2 className="text-lg font-bold mb-4">Available Items</h2>
            <AuctionSelector items={allItems} selectedId={selectedItem.id} />
          </div>
        )}
        <ChatBox />
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
        <div className="bg-gray-100 rounded-lg m-4 p-4 mb-4">
          <p className="font-semibold">Description:</p>
          <p>{selectedItem.description}</p>
        </div>
      </div>

      {/* Right: Item details */}
      <div className="lg:w-1/3 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">{selectedItem.name}</h1>
          <form action={createBidAction.bind(null, selectedItem.id)}>
            <Button size="sm" disabled={isExpired || !isSignedIn}>
              Place Bid
            </Button>
          </form>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <p className="font-semibold">Time Left:</p>
          <Countdown endTime={selectedItem.bidEndTime} />
        </div>

        <Image
          src={selectedItem.imageURL}
          alt={selectedItem.name}
          width={200}
          height={200}
          className="rounded-lg mb-4 mx-auto"
        />

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
