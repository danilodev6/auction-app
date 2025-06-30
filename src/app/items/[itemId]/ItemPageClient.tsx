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
import { formatSimpleDate } from "@/util/date2";

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
    return new Intl.DateTimeFormat("es-AR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  const handleBid = async () => {
    setIsBidding(true);
    try {
      // Calculate the bid amount - if no bids yet, start from starting price
      const bidAmount =
        item.currentBid === 0
          ? item.startingPrice
          : item.currentBid + item.bidInterval;
      await createBidAction(item.id, bidAmount);
      // Refresh data after placing bid
      router.refresh();
    } catch (error) {
      console.error("Failed to place bid:", error);
    } finally {
      setTimeout(() => {
        setIsBidding(false);
      }, 2000);
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
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <main className="mx-auto container">
      <h1 className="text-4xl font-bold text-center mb-10">{item.name}</h1>
      <div className="flex gap-12 w-full justify-center">
        <div className="w-1/3">
          {item.imageURL ? (
            <Image
              className="m-auto rounded-md"
              src={item.imageURL}
              alt={item.name}
              width={350}
              height={350}
              priority
            />
          ) : (
            <div
              className="m-auto rounded-md border-2 bg-gray-200 flex items-center justify-center"
              style={{ width: 300, height: 300 }}
            >
              <span className="text-gray-500">No image available</span>
            </div>
          )}

          <div className="mt-3 bg-white rounded-md p-4">
            Descripción: <br />
            <span className="font-bold">
              {item.description || "No description available"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center w-1/4">
          {isDirectSale ? (
            <div className="flex flex-col items-center gap-4">
              <div
                className={`rounded-md p-4 ${isSold ? "bg-red-50" : "bg-accent"}`}
              >
                <p
                  className={`font-semibold ${isSold ? "text-red-800" : "text-primary"}`}
                >
                  {isSold
                    ? "Este producto ya fue vendido"
                    : "Disponible para compra inmediata"}
                </p>
              </div>
              <Button
                onClick={handlePurchase}
                disabled={!isSignedIn || isPurchasing || isSold}
                className={
                  isSold
                    ? "bg-gray-400 hover:bg-gray-500 w-full cursor-not-allowed"
                    : "w-full"
                }
              >
                {isSold
                  ? "VENDIDO"
                  : isPurchasing
                    ? "Procesando..."
                    : isSignedIn
                      ? `Comprar ahora por $ ${item.startingPrice}`
                      : "Inicia sesión para comprar"}
              </Button>
            </div>
          ) : (
            <>
              <Button
                onClick={handleBid}
                disabled={isBidding || isExpired || !isSignedIn}
                className="w-full"
              >
                {isExpired
                  ? "Subasta Finalizada"
                  : isBidding
                    ? "Procesando..."
                    : isSignedIn
                      ? `Pujar a $ ${formatToDollar(item.currentBid === 0 ? item.startingPrice : item.currentBid + item.bidInterval)}`
                      : "Inicia sesión"}
              </Button>
              <div className="mt-3 w-full bg-white rounded-md p-4">
                Precio actual:{" "}
                <span className="font-bold">
                  $ {formatToDollar(item.currentBid)}
                </span>
              </div>
              <div className="mt-3 bg-white rounded-md w-full p-4">
                <div className="rounded-md">
                  <p>Finaliza: </p>{" "}
                  <span className="font-bold">
                    {formatSimpleDate(item.bidEndTime)}
                  </span>
                </div>
                {new Date(item.bidEndTime).getTime() - Date.now() <
                  24 * 60 * 60 * 1000 && (
                  <div className="rounded-md mt-1">
                    Tiempo restante:{" "}
                    <Countdown endTime={item.bidEndTime.toISOString()} />
                  </div>
                )}
              </div>
              <div className="mt-3 bg-white w-full rounded-md p-4">
                Precio inicio:{" "}
                <span className="font-bold">
                  $ {formatToDollar(item.startingPrice)}
                </span>
              </div>
              <div className="mt-3 w-full bg-white rounded-md p-4">
                Intervalo por puja:{" "}
                <span className="font-bold">
                  $ {formatToDollar(item.bidInterval)}
                </span>
              </div>
            </>
          )}
        </div>
        {!isDirectSale && (
          <div className="w-1/3">
            <div className="flex gap-4 w-full">
              {hasBids ? (
                <div className="rounded-md w-full">
                  <h2 className="text-xl text-center mb-2">
                    Lista de últimas pujas
                  </h2>
                  <ul className="flex flex-col gap-3">
                    {[...bids].slice(0, 6).map((bid) => (
                      <li
                        key={bid.id}
                        className="flex w-full justify-between items-center py-3 bg-white rounded-md px-4"
                      >
                        <div>
                          <span className="font-bold">
                            $ {formatToDollar(bid.amount)}
                          </span>{" "}
                          por{" "}
                          <span className="font-bold">
                            {bid.users.name || "Anonymous"}
                          </span>{" "}
                          - <span>{formatDate(bid.timestamp)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-white w-full text-center rounded-md p-4">
                  <p className="text-xl w-full">No hay pujas por el momento</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-md p-8 max-w-md mx-4">
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
                Gracias por tu compra!
              </h3>
              <p className="text-gray-600 mb-6">
                Recibimos su orden de compra por <strong>{item.name}</strong>.
                Nos comunicaremos con usted a la brevedad. Para coordinar el
                retiro.
              </p>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
