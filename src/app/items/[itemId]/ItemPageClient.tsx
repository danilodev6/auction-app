"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatToDollar } from "@/util/currency";
import { Countdown } from "@/components/Countdown";
import Image from "next/image";
import Pusher from "pusher-js";
import { createBidAction } from "./actions";
import { purchaseItemAction } from "./actions";

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
  status: string;
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

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isBidding, setIsBidding] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  const isExpired = new Date(item.bidEndTime) < new Date();
  const hasBids = bids.length > 0;
  const isDirectSale = item.auctionType === "direct";
  const isSold = item.status === "sold";

  useEffect(() => {
    // Only set up Pusher for auction items, not direct sales
    if (isDirectSale) return;

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
  }, [item.id, isDirectSale]);

  function formatDate(dateInput: Date) {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Invalid date";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  const handleBid = async () => {
    setIsBidding(true);
    try {
      await createBidAction(item.id);
      // Refresh data after placing bid
      router.refresh();
    } catch (error) {
      console.error("Failed to place bid:", error);
    } finally {
      setTimeout(() => {
        setIsBidding(false);
      }, 4000);
    }
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      await purchaseItemAction(item.id);
      // Update local state to reflect the purchase
      setItem((prev) => ({ ...prev, status: "sold" }));
      // Show success modal
      setShowSuccessModal(true);
      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error("Failed to purchase item:", error);
      // You might want to show an error message to user
    } finally {
      setIsPurchasing(false);
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
            {isDirectSale ? (
              <div className="col-span-2 mt-3 bg-gray-100 rounded-lg p-4">
                Sale Price:{" "}
                <span className="font-bold text-lg text-green-600">
                  $ {formatToDollar(item.startingPrice)}
                </span>
              </div>
            ) : (
              <>
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
                    {formatDate(item.bidEndTime)}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="mt-3 bg-gray-100 rounded-lg p-4">
            Description: <br />
            <span className="font-bold">
              {item.description || "No description available"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {isDirectSale ? (
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-2xl font-bold">
                {isSold ? "Sold" : "Buy Now"}
              </h2>
              <div
                className={`border rounded-lg p-4 ${isSold ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
              >
                <p
                  className={`font-semibold ${isSold ? "text-red-800" : "text-green-800"}`}
                >
                  {isSold
                    ? "This item has been sold"
                    : "Available for immediate purchase"}
                </p>
              </div>
              <Button
                onClick={handlePurchase}
                disabled={!isSignedIn || isPurchasing || isSold}
                className={
                  isSold
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }
                size="lg"
              >
                {isSold
                  ? "SOLD"
                  : isPurchasing
                    ? "Processing..."
                    : isSignedIn
                      ? `Buy Now`
                      : "Sign in to buy"}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex gap-6 items-center">
                <h2 className="text-2xl font-bold">Current bids</h2>
                <Button
                  onClick={handleBid}
                  disabled={isBidding || isExpired || !isSignedIn}
                >
                  {isExpired
                    ? "Auction Ended"
                    : isBidding
                      ? "Bid Placed..."
                      : isSignedIn
                        ? "Place a bid"
                        : "Sign in to bid"}
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
            </>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Thank you for your purchase!
              </h3>
              <p className="text-gray-600 mb-6">
                We have received your order for <strong>{item.name}</strong>. We
                will call you shortly to arrange delivery and payment.
              </p>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
