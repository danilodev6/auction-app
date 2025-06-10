"use client";

import { useState, useEffect } from "react";
import { Countdown } from "@/components/Countdown";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { formatToDollar } from "@/util/currency";
import { createBidAction } from "@/app/items/[itemId]/actions";
import ChatBox from "@/components/ChatBox";
import Pusher from "pusher-js";

type Item = {
  id: number;
  name: string;
  imageURL: string | null;
  bidEndTime: Date;
  currentBid: number;
  startingPrice: number;
  bidInterval: number;
  description: string | null;
  auctionType: string;
  isFeatured: boolean;
};

type Bid = {
  id: number;
  amount: number;
  timestamp: Date;
  users: {
    name: string | null; // Allow null
  };
};

export default function LivePage({
  initialItems,
  userIsAdmin,
  isSignedIn,
}: {
  initialItems: Item[];
  userIsAdmin: boolean;
  isSignedIn: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [featuredItem, setFeaturedItem] = useState<Item | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  // const [isConnected, setIsConnected] = useState(false);

  // Filter items for live streaming
  const liveItems = items.filter((item) => item.auctionType === "live");

  useEffect(() => {
    // Find the featured item
    const featured = liveItems.find((item) => item.isFeatured) || null;
    setFeaturedItem(featured);

    if (featured) {
      // Fetch initial bids
      const fetchBids = async () => {
        const response = await fetch(`/api/bids?itemId=${featured.id}`);
        const data = await response.json();
        setBids(data);
      };

      fetchBids();
    }
  }, [items, liveItems]);

  useEffect(() => {
    if (!featuredItem) return;

    // Set up Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`item-${featuredItem.id}`);

    channel.bind("new-bid", (data: { bid: Bid; currentBid: number }) => {
      // Update bids
      setBids((prev) => [...prev, data.bid]);

      // Update current bid
      setItems((prev) =>
        prev.map((item) =>
          item.id === featuredItem.id
            ? { ...item, currentBid: data.currentBid }
            : item,
        ),
      );

      // Update featured item if needed
      setFeaturedItem((prev) =>
        prev && prev.id === featuredItem.id
          ? { ...prev, currentBid: data.currentBid }
          : prev,
      );
    });

    // setIsConnected(true);

    return () => {
      pusher.unsubscribe(`item-${featuredItem.id}`);
    };
  }, [featuredItem]);

  const handleBid = async () => {
    if (!featuredItem) return;
    try {
      await createBidAction(featuredItem.id);
    } catch (error) {
      console.error("Failed to place bid:", error);
    }
  };

  const latestBids = bids.reverse().slice(-6);
  const isExpired = featuredItem
    ? new Date(featuredItem.bidEndTime) < new Date()
    : false;

  return (
    <main className="flex flex-col w-full lg:flex-row gap-6">
      {/* Left: Chat section */}
      <div className="lg:w-1/4 p-4 border-r">
        {userIsAdmin && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Live Auction Status</h2>
            {/* ... admin status messages ... */}
          </div>
        )}

        {featuredItem ? (
          <ChatBox itemId={featuredItem.id} />
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
            <p>{featuredItem.description || "No description available"}</p>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg m-4 p-4 mb-4">
            <p className="text-center text-gray-600">
              No live auction currently running
            </p>
          </div>
        )}
      </div>

      {/* Right: Item details */}
      {featuredItem ? (
        <>
          <div className="lg:w-1/4 p-4">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold">{featuredItem.name}</h1>
              <Button
                onClick={handleBid}
                size="sm"
                disabled={isExpired || !isSignedIn}
              >
                {!isSignedIn
                  ? "Sign In to Bid"
                  : isExpired
                    ? "Auction Ended"
                    : "Place Bid"}
              </Button>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="font-semibold">Time Left:</p>
              <Countdown endTime={featuredItem.bidEndTime.toISOString()} />
            </div>

            {featuredItem.imageURL ? (
              <Image
                src={featuredItem.imageURL}
                alt={featuredItem.name}
                width={200}
                height={200}
                className="rounded-lg mb-4 mx-auto"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-200 rounded-lg mb-4 mx-auto flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
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
                    <p className="text-sm">
                      by {bid.users.name || "Anonymous"}
                    </p>
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
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">
              No live auction currently featured
            </p>
            <p className="text-gray-500">Check back later for live auctions!</p>
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
