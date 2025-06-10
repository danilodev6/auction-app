"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatToDollar } from "@/util/currency";
import { Countdown } from "@/components/Countdown";
import Image from "next/image";
import Pusher from "pusher-js";
import { createBidAction } from "./actions";

type Item = {
  id: number;
  name: string;
  imageURL: string | null;
  bidEndTime: Date;
  currentBid: number;
  startingPrice: number;
  bidInterval: number;
  description: string | null;
};

type Bid = {
  id: number;
  amount: number;
  timestamp: Date;
  users: {
    name: string | null;
  };
};

export default function ItemPageClient({
  initialItem,
  initialBids,
  isSignedIn,
}: {
  initialItem: Item;
  initialBids: Bid[];
  isSignedIn: boolean;
}) {
  const [item, setItem] = useState({
    ...initialItem,
    bidEndTime: new Date(initialItem.bidEndTime),
  });

  const [bids, setBids] = useState(
    initialBids.map((bid) => ({
      ...bid,
      timestamp: new Date(bid.timestamp),
    })),
  );

  const router = useRouter();

  const isExpired = new Date(item.bidEndTime) < new Date();
  const hasBids = bids.length > 0;

  useEffect(() => {
    // Set up Pusher for real-time updates
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`item-${item.id}`);

    channel.bind("new-bid", (data: { bid: Bid; currentBid: number }) => {
      // Update bids
      setBids((prev) => [data.bid, ...prev]);

      // Update current bid
      setItem((prev) => ({
        ...prev,
        currentBid: data.currentBid,
      }));
    });

    return () => {
      pusher.unsubscribe(`item-${item.id}`);
    };
  }, [item.id]);

  function formatDate(dateInput: Date) {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Invalid date";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  const handleBid = async () => {
    try {
      await createBidAction(item.id);
      // Refresh data after placing bid
      router.refresh();
    } catch (error) {
      console.error("Failed to place bid:", error);
    }
  };

  return (
    <main className="mx-auto">
      <h1 className="text-4xl font-bold text-center mb-10">{item.name}</h1>
      <div className="flex gap-28 w-full justify-center">
        <div>
          <p className="text-2xl font-bold">Details</p>
          {item.imageURL ? (
            <Image
              className="m-auto rounded-xl border-2"
              src={item.imageURL}
              alt={item.name}
              width={300}
              height={300}
            />
          ) : (
            <div
              className="m-auto rounded-xl border-2 bg-gray-200 flex items-center justify-center"
              style={{ width: 300, height: 300 }}
            >
              <span className="text-gray-500">No image available</span>
            </div>
          )}

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
              <span className="font-bold">{formatDate(item.bidEndTime)}</span>
            </div>
          </div>
          <div className="mt-3 bg-gray-100 rounded-lg p-4">
            Description: <br />
            <span className="font-bold">
              {item.description || "No description available"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex gap-6 items-center">
            <h2 className="text-2xl font-bold">Current bids</h2>
            <Button onClick={handleBid} disabled={isExpired || !isSignedIn}>
              {isSignedIn ? "Place a bid" : "Sign in to bid"}
            </Button>
          </div>
          <div className="mt-3 bg-gray-100 rounded-lg p-4">
            Time Left: <Countdown endTime={item.bidEndTime.toISOString()} />
          </div>

          {hasBids ? (
            <div className="bg-gray-100 rounded-lg p-4 mt-4">
              <ul className="flex flex-col gap-3">
                {[...bids].slice(0, 6).map((bid) => (
                  <li
                    key={bid.id}
                    className="flex w-full justify-between items-center py-3 bg-white rounded-lg px-4"
                  >
                    <div>
                      <span className="font-bold">
                        $ {formatToDollar(bid.amount)}
                      </span>{" "}
                      by{" "}
                      <span className="font-bold">
                        {bid.users.name || "Anonymous"}
                      </span>{" "}
                      at <span>{formatDate(bid.timestamp)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-4 mt-4">
              <p className="text-xl w-full">No bids yet</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
