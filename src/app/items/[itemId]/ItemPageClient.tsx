"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatToDollar } from "@/util/currency";
import { Countdown } from "@/components/Countdown";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher-client";
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const router = useRouter();

  const isExpired = new Date(item.bidEndTime) < new Date();
  const hasBids = bids.length > 0;
  const isDirectSale = item.auctionType === "direct";
  const isSold = item.status === "sold";

  useEffect(() => {
    // Only set up Pusher for auction items, not direct sales
    if (isDirectSale) return;

    const channel = pusherClient.subscribe(`item-${item.id}`);

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
      pusherClient.unsubscribe(`item-${item.id}`);
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
    <main className="container mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 lg:mb-10">
        {item.name}
      </h1>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Item Image */}
        <div className="mb-6">
          {item.imageURL ? (
            <Image
              className="mx-auto rounded-md w-full max-w-sm"
              src={item.imageURL}
              alt={item.name}
              width={350}
              height={350}
              priority
            />
          ) : (
            <div className="mx-auto rounded-md border-2 bg-gray-200 flex items-center justify-center w-full max-w-sm aspect-square">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-6 bg-white rounded-md p-4">
          <p className="font-semibold mb-2">Descripción:</p>
          <p>{item.description || "No description available"}</p>
        </div>

        {/* Bidding/Purchase Section */}
        <div className="mb-6">
          {isDirectSale ? (
            <div className="flex flex-col gap-4">
              <div
                className={`rounded-md p-4 text-center ${isSold ? "bg-red-50" : "bg-accent"}`}
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
                onClick={() => setShowConfirmModal(true)}
                disabled={!isSignedIn || isPurchasing || isSold}
                className={`w-full ${isSold ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed" : ""}`}
                size="lg"
              >
                {isSold
                  ? "VENDIDO"
                  : isPurchasing
                    ? "Procesando..."
                    : isSignedIn
                      ? `Comprar ahora por $ ${formatToDollar(item.startingPrice)}`
                      : "Inicia sesión para comprar"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={handleBid}
                disabled={isBidding || isExpired || !isSignedIn}
                className="w-full"
                size="lg"
              >
                {isExpired
                  ? "Subasta Finalizada"
                  : isBidding
                    ? "Procesando..."
                    : isSignedIn
                      ? `Pujar a $ ${formatToDollar(item.currentBid === 0 ? item.startingPrice : item.currentBid + item.bidInterval)}`
                      : "Inicia sesión"}
              </Button>

              {/* Auction Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-md p-4">
                  <p className="text-sm text-gray-600">Precio actual</p>
                  <p className="font-bold text-lg">
                    $ {formatToDollar(item.currentBid)}
                  </p>
                </div>
                <div className="bg-white rounded-md p-4">
                  <p className="text-sm text-gray-600">Precio inicio</p>
                  <p className="font-bold text-lg">
                    $ {formatToDollar(item.startingPrice)}
                  </p>
                </div>
                <div className="bg-white rounded-md p-4">
                  <p className="text-sm text-gray-600">Intervalo por puja</p>
                  <p className="font-bold text-lg">
                    $ {formatToDollar(item.bidInterval)}
                  </p>
                </div>
                <div className="bg-white rounded-md p-4">
                  <p className="text-sm text-gray-600">Finaliza</p>
                  <p className="font-bold text-sm">
                    {formatSimpleDate(item.bidEndTime)}
                  </p>
                  {new Date(item.bidEndTime).getTime() - Date.now() <
                    24 * 60 * 60 * 1000 && (
                    <div className="mt-1">
                      <p className="text-xs text-gray-600">Tiempo restante:</p>
                      <Countdown endTime={item.bidEndTime.toISOString()} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bids Section for Mobile */}
        {!isDirectSale && (
          <div className="bg-white rounded-md p-4">
            <h2 className="text-xl font-bold text-center mb-4">
              Lista de últimas pujas
            </h2>
            {hasBids ? (
              <div className="space-y-3">
                {[...bids].slice(0, 6).map((bid) => (
                  <div
                    key={bid.id}
                    className="border-b border-gray-100 pb-3 last:border-b-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg">
                          $ {formatToDollar(bid.amount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          por{" "}
                          <span className="font-semibold">
                            {bid.users.name || "Anonymous"}
                          </span>
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(bid.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No hay pujas por el momento
              </p>
            )}
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex gap-12 w-full justify-center">
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
                onClick={() => setShowConfirmModal(true)}
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
                      ? `Reservar este producto por $ ${formatToDollar(item.startingPrice)}`
                      : "Inicia sesión para comprar"}
              </Button>
              <p className="text-sm text-gray-600 text-center">
                * Al hacer clic en reservar, este producto quedará marcado como
                vendido. Lo pagarás y retirarás en persona.
              </p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
          <div className="bg-white rounded-md p-6 sm:p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-green-500"
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
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Reserva realizada!
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                El producto <strong>{item.name}</strong> ha sido marcado como{" "}
                <strong>VENDIDO</strong> a tu nombre. Nos comunicaremos con vos
                para coordinar el retiro y pago en persona.
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
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
          <div className="bg-white rounded-md p-6 sm:p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                ¿Confirmar reserva?
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Este producto se marcará como <strong>VENDIDO</strong> a tu
                nombre y no podrá ser comprado por otro usuario.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  onClick={() => {
                    setShowConfirmModal(false); // close the modal
                    handlePurchase(); // ← actually buy
                  }}
                  className="w-full sm:w-auto"
                >
                  Sí, reservar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
