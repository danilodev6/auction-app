"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { formatToDollar } from "@/util/currency";
import { createBidAction } from "@/app/items/[itemId]/actions";
import ChatBox from "@/components/ChatBox";
import { Switch } from "@/components/ui/switch";
import { useClientOnly } from "@/hooks/useClientOnly";
import { pusherClient } from "@/lib/pusher-client";
import { getOptimizedImageUrl, getImageKitUrl } from "@/lib/imagekit";

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
  isAvailable: boolean;
};

type Bid = {
  id: number;
  amount: number;
  timestamp: Date;
  users: {
    name: string | null;
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
  const [isAvailable, setIsAvailable] = useState(true);
  const [isBidding, setIsBidding] = useState(false);

  // Use the custom hooks
  const isClient = useClientOnly();
  // const { pusher, isReady } = usePusherClient();
  const pusher = pusherClient;

  // Filter items for live streaming
  const liveItems = items.filter((item) => item.auctionType === "live");

  // const getProxyImageUrl = (imageUrl: string | null) => {
  //   if (!imageUrl) return null;
  //   return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
  // };

  const getImageKitSrc = (imageUrl: string | null) => {
    if (!imageUrl) return null;

    return (
      getOptimizedImageUrl(imageUrl, {
        width: 400,
        height: 400,
        format: "auto",
        crop: "fill",
      }) || getImageKitUrl(imageUrl)
    );
  };

  useEffect(() => {
    const featured = liveItems.find((item) => item.isFeatured) || null;
    setFeaturedItem(featured);
  }, [liveItems]);

  useEffect(() => {
    if (!featuredItem || !isClient) return;

    const fetchBids = async () => {
      try {
        const response = await fetch(`/api/bids?itemId=${featuredItem.id}`);
        const data = await response.json();
        setBids(data);
      } catch (error) {
        console.error("Failed to fetch bids:", error);
      }
    };

    fetchBids();
  }, [featuredItem, isClient]);

  // Pusher for featured item changes
  useEffect(() => {
    if (!pusher) return;

    const channel = pusher.subscribe("live-auction");

    channel.bind("featured-changed", (data: { item: Item }) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === data.item.id
            ? { ...data.item }
            : { ...item, isFeatured: false },
        ),
      );
      setFeaturedItem(data.item);
    });

    return () => {
      pusher.unsubscribe("live-auction");
    };
  }, [pusher]);

  //Pusher for bids and availability
  useEffect(() => {
    if (!featuredItem?.id || !pusher) return;

    const channel = pusher.subscribe(`item-${featuredItem.id}`);

    const handleNewBid = (data: { bid: Bid; currentBid: number }) => {
      setBids((prev) => {
        const exists = prev.some((b) => b.id === data.bid.id);
        return exists ? prev : [data.bid, ...prev];
      });

      setItems((prev) =>
        prev.map((item) =>
          item.id === featuredItem.id
            ? { ...item, currentBid: data.currentBid }
            : item,
        ),
      );

      setFeaturedItem((prev) =>
        prev && prev.id === featuredItem.id
          ? { ...prev, currentBid: data.currentBid }
          : prev,
      );
    };

    const handleAvailabilityChange = (data: { isAvailable: boolean }) => {
      setIsAvailable(data.isAvailable);
    };

    // Bind multiple events to the same channel
    channel.bind("new-bid", handleNewBid);
    channel.bind("availability-changed", handleAvailabilityChange);

    return () => {
      channel.unbind("new-bid", handleNewBid);
      channel.unbind("availability-changed", handleAvailabilityChange);
      pusher.unsubscribe(`item-${featuredItem.id}`);
    };
  }, [featuredItem?.id, pusher]);

  // Pusher for bids
  // useEffect(() => {
  //   if (!featuredItem?.id || !pusher) return;
  //
  //   const channel = pusher.subscribe(`item-${featuredItem.id}`);
  //
  //   channel.bind("new-bid", (data: { bid: Bid; currentBid: number }) => {
  //     setBids((prev) => {
  //       const exists = prev.some((b) => b.id === data.bid.id);
  //       return exists ? prev : [data.bid, ...prev];
  //     });
  //
  //     setItems((prev) =>
  //       prev.map((item) =>
  //         item.id === featuredItem.id
  //           ? { ...item, currentBid: data.currentBid }
  //           : item,
  //       ),
  //     );
  //
  //     setFeaturedItem((prev) =>
  //       prev && prev.id === featuredItem.id
  //         ? { ...prev, currentBid: data.currentBid }
  //         : prev,
  //     );
  //   });
  //
  //   return () => {
  //     pusher.unsubscribe(`item-${featuredItem.id}`);
  //   };
  // }, [featuredItem?.id, pusher]);
  //
  // useEffect(() => {
  //   if (!featuredItem?.id || !pusher) return;
  //
  //   const channel = pusher.subscribe(`item-${featuredItem.id}`);
  //
  //   channel.bind("availability-changed", (data: { isAvailable: boolean }) => {
  //     setIsAvailable(data.isAvailable);
  //   });
  //
  //   return () => {
  //     pusher.unsubscribe(`item-${featuredItem.id}`);
  //   };
  // }, [featuredItem?.id, pusher]);

  const handleAvailabilityChange = async (checked: boolean) => {
    setIsAvailable(checked);

    // Send to your backend API to update database and broadcast
    try {
      await fetch("/api/auction-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: featuredItem?.id,
          isAvailable: checked,
        }),
      });
    } catch (error) {
      console.error("Failed to update availability:", error);
    }
  };

  const handleBid = async (multiplier: number = 1) => {
    setIsBidding(true);
    if (!featuredItem) return;

    const bidAmount =
      featuredItem.currentBid === 0
        ? featuredItem.startingPrice
        : featuredItem.currentBid + featuredItem.bidInterval * multiplier;

    try {
      await createBidAction(featuredItem.id, bidAmount);
    } catch (error) {
      console.error("Failed to place bid:", error);
    } finally {
      setTimeout(() => {
        setIsBidding(false);
      }, 1500);
    }
  };

  const getBidAmounts = () => {
    if (!featuredItem) return [];

    const interval = featuredItem.bidInterval;

    return [
      { multiplier: 1, amount: interval },
      { multiplier: 2, amount: interval * 2 },
      { multiplier: 3, amount: interval * 3 },
    ];
  };

  const bidAmounts = getBidAmounts();
  const latestBids = bids.slice(0, 6);

  // Show loading state during hydration
  if (!isClient) {
    return (
      <main className="flex flex-col w-full gap-4 p-4">
        <div className="w-full">
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
            <p className="text-gray-600">Loading stream...</p>
          </div>
        </div>
        <div className="w-full flex items-center justify-center">
          <p className="text-gray-600">Loading auction details...</p>
        </div>
        <div className="w-full">
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full">
      {/* Admin controls - always at top */}
      {/* {userIsAdmin && ( */}
      {/*   <div className="p-4 border-b"> */}
      {/* {liveItems.length === 0 && ( */}
      {/*   <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4"> */}
      {/*     <p className="text-sm text-yellow-800"> */}
      {/*       No live or draft auctions available.{" "} */}
      {/*       <Link href="/items/create" className="underline"> */}
      {/*         Create one */}
      {/*       </Link>{" "} */}
      {/*       or{" "} */}
      {/*       <Link href="/items/manage" className="underline"> */}
      {/*         manage existing items */}
      {/*       </Link> */}
      {/*       . */}
      {/*     </p> */}
      {/*   </div> */}
      {/* )} */}

      {/* {liveItems.length > 0 && !featuredItem && ( */}
      {/*   <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4"> */}
      {/*     <p className="text-sm text-blue-800"> */}
      {/*       You have {liveItems.length} live auction(s) but none are */}
      {/*       featured.{" "} */}
      {/*       <Link href="/items/manage" className="underline"> */}
      {/*         Feature an item */}
      {/*       </Link>{" "} */}
      {/*       to display it on the live stream. */}
      {/*     </p> */}
      {/*   </div> */}
      {/* )} */}

      {/* {featuredItem && ( */}
      {/*   <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4"> */}
      {/*     <p className="text-sm text-green-800"> */}
      {/*       ✅ Currently featuring: <strong>{featuredItem.name}</strong> */}
      {/*     </p> */}
      {/*     <p className="text-xs text-green-600 mt-1"> */}
      {/*       <Link href="/items/manage" className="underline"> */}
      {/*         Manage items */}
      {/*       </Link>{" "} */}
      {/*       to change featured auction */}
      {/*     </p> */}
      {/*   </div> */}
      {/* )} */}
      {/*   </div> */}
      {/* )} */}

      {/* Mobile/Tablet Layout: Stacked sections */}
      <div className="lg:hidden flex flex-col">
        {/* 1st section: Live stream and description */}
        <div className="p-4">
          <h1 className="text-center text-primary text-2xl sm:text-3xl mb-4">
            Subasta en VIVO
          </h1>
          <div className="w-full aspect-video rounded-md overflow-hidden mb-4">
            <iframe
              src="https://player.twitch.tv/?channel=tbsubastas2&parent=www.tbsubastas.com"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {featuredItem ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center bg-primary text-white rounded-md p-4 mb-4 gap-4">
                <div className="flex items-center gap-2">
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                    🟢 VIVO
                  </span>
                  <p className="font-semibold">Subastando:</p>
                  <p className="text-lg font-bold">{featuredItem.name}</p>
                </div>
                {userIsAdmin && (
                  <div className="flex items-center text-primary bg-accent rounded-md p-2 sm:ml-auto">
                    <p className="mr-2 text-sm">Activar o desactivar subasta</p>
                    <Switch
                      checked={isAvailable}
                      onCheckedChange={handleAvailabilityChange}
                    />
                  </div>
                )}
              </div>

              <div className="bg-white rounded-md p-4">
                <p className="font-semibold mb-2">Descripción:</p>
                <p className="text-sm">
                  {featuredItem.description || "No description available"}
                </p>
              </div>
            </>
          ) : (
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-center text-gray-600">
                No hay subasta en vivo actualmente
              </p>
            </div>
          )}
        </div>

        {featuredItem && (
          <>
            {/* 2nd section: Bid buttons and item details */}
            <div className="p-4 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bidding section */}
                <div className="order-2 sm:order-1">
                  <div className="mb-4">
                    <div className="flex flex-col gap-2">
                      {!isSignedIn ? (
                        <Button className="w-full" size="sm" disabled>
                          Inicia sesión
                        </Button>
                      ) : !isAvailable ? (
                        <Button className="w-full" size="sm" disabled>
                          Finalizada
                        </Button>
                      ) : featuredItem.currentBid === 0 ? (
                        <Button
                          className="w-full"
                          size="sm"
                          onClick={() => handleBid(0)}
                          disabled={isBidding || !isAvailable}
                        >
                          Pujar a $ {formatToDollar(featuredItem.startingPrice)}
                        </Button>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {bidAmounts.map((bid, index) => (
                            <Button
                              key={index}
                              onClick={() => handleBid(bid.multiplier)}
                              size="sm"
                              disabled={isBidding}
                            >
                              $ {formatToDollar(bid.amount)}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing info */}
                  <div className="space-y-2">
                    <div className="bg-white rounded-md p-3">
                      <span className="text-sm">Precio actual: </span>
                      <span className="font-bold">
                        $ {formatToDollar(featuredItem.currentBid)}
                      </span>
                    </div>
                    <div className="bg-white rounded-md p-3">
                      <span className="text-sm">Precio inicio: </span>
                      <span className="font-bold">
                        $ {formatToDollar(featuredItem.startingPrice)}
                      </span>
                    </div>
                    <div className="bg-white rounded-md p-3">
                      <span className="text-sm">Intervalo: </span>
                      <span className="font-bold">
                        $ {formatToDollar(featuredItem.bidInterval)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Item image */}
                <div className="order-2 sm:order-2 flex justify-center">
                  {featuredItem.imageURL ? (
                    <Image
                      src={getImageKitSrc(featuredItem.imageURL) || ""}
                      alt={featuredItem.name}
                      width={200}
                      height={200}
                      className="rounded-lg max-w-full h-auto"
                      priority
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        No image available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3rd section: Latest bids */}
            <div className="p-4 border-t">
              <h3 className="font-bold mb-3">Lista de pujas</h3>
              {latestBids.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {latestBids.map((bid) => (
                    <div key={bid.id} className="bg-white p-3 rounded-md">
                      <p className="font-bold">${formatToDollar(bid.amount)}</p>
                      <p className="text-sm">{bid.users.name || "Anonymous"}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(bid.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay pujas por el momento</p>
              )}
            </div>
          </>
        )}

        {/* 4th section: Chat */}
        <div className="p-4 border-t">
          <h3 className="font-bold mb-3">Chat</h3>
          {featuredItem ? (
            <ChatBox itemId={featuredItem.id} />
          ) : (
            <p className="text-gray-600 text-center">
              El Chat estará disponible aquí durante el vivo
            </p>
          )}
        </div>

        {/* Placeholder when no featured item */}
        {!featuredItem && (
          <div className="p-4 flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <p className="text-xl text-gray-600 mb-4">
                No hay subasta en vivo actualmente
              </p>
              <p className="text-gray-500">
                Chequea la fecha del próximo vivo en el Home
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Layout: Original side-by-side layout */}
      <div className="hidden lg:flex lg:flex-row gap-6">
        {/* Left: Chat section */}
        <div className="lg:w-1/4 p-4">
          <h3 className="text-xl font-bold">Chat</h3>
          {featuredItem ? (
            <ChatBox itemId={featuredItem.id} />
          ) : (
            <p className="text-gray-600 text-center">
              El Chat estará disponible aquí durante el vivo
            </p>
          )}
        </div>

        {/* Middle: Twitch Stream */}
        <div className="lg:w-4/4 p-4">
          <h1 className="text-center text-primary text-3xl">Subasta en VIVO</h1>
          <div className="w-full max-w-[960px] mx-auto aspect-video mt-2 rounded-md overflow-hidden">
            <iframe
              src="https://player.twitch.tv/?channel=tbsubastas2&parent=www.tbsubastas.com"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {featuredItem ? (
            <div className="flex place-items-center bg-primary text-white rounded-md m-4 p-4 min-h-[5rem]">
              <div className="flex mx-auto place-items-center gap-2">
                <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                  🟢 VIVO
                </span>
                <p className="font-semibold">Subastando:</p>
                <p className="text-lg font-bold">{featuredItem.name}</p>
              </div>
              {userIsAdmin && (
                <div className="flex place-items-center ml-auto text-primary bg-accent rounded-md p-2">
                  <p className="mr-2">Activar o desactivar subasta</p>
                  <Switch
                    checked={isAvailable}
                    onCheckedChange={handleAvailabilityChange}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg m-4 p-4 mb-4">
              <p className="text-center text-gray-600">
                No hay subasta en vivo actualmente
              </p>
            </div>
          )}
        </div>

        {/* Right: Item details */}
        {featuredItem ? (
          <>
            <div className="lg:w-1/3 p-4">
              <div className="mb-4 overflow-hidden">
                <div className="flex gap-2 w-full">
                  {!isSignedIn ? (
                    <Button className="flex-1" size="sm" disabled>
                      Inicia sesión
                    </Button>
                  ) : !isAvailable ? (
                    <Button className="flex-1" size="sm" disabled>
                      Finalizada
                    </Button>
                  ) : featuredItem.currentBid === 0 ? (
                    <Button
                      className="flex-1"
                      size="sm"
                      onClick={() => handleBid(0)}
                      disabled={isBidding || !isAvailable}
                    >
                      Pujar a $ {formatToDollar(featuredItem.startingPrice)}
                    </Button>
                  ) : (
                    <>
                      {bidAmounts.map((bid, index) => (
                        <Button
                          key={index}
                          onClick={() => handleBid(bid.multiplier)}
                          size="sm"
                          className="flex-1"
                          disabled={isBidding}
                        >
                          $ {formatToDollar(bid.amount)}
                        </Button>
                      ))}
                    </>
                  )}
                </div>
              </div>
              {featuredItem.imageURL ? (
                <Image
                  src={featuredItem.imageURL}
                  alt={featuredItem.name}
                  width={220}
                  height={220}
                  className="rounded-lg mb-4 mx-auto"
                  priority
                />
              ) : (
                <div className="w-48 h-48 bg-gray-200 rounded-lg mb-4 mx-auto flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
              <div className="mt-3 w-full bg-white rounded-md p-4">
                <p className="font-semibold">Descripción:</p>
                <p>{featuredItem.description || "No description available"}</p>
              </div>
              <div className="mt-3 w-full bg-white rounded-md p-4">
                Precio actual:{" "}
                <span className="font-bold">
                  $ {formatToDollar(featuredItem.currentBid)}
                </span>
              </div>
              <div className="mt-3 bg-white w-full rounded-md p-4">
                Precio inicio:{" "}
                <span className="font-bold">
                  $ {formatToDollar(featuredItem.startingPrice)}
                </span>
              </div>
              <div className="mt-3 w-full bg-white rounded-md p-4">
                Intervalo:{" "}
                <span className="font-bold">
                  $ {formatToDollar(featuredItem.bidInterval)}
                </span>
              </div>
            </div>

            {/* Bids */}
            <div className="lg:w-1/4 p-4">
              <h3 className="font-bold mb-2">Lista de pujas</h3>
              {latestBids.length > 0 ? (
                <div className="space-y-2">
                  {latestBids.map((bid) => (
                    <div key={bid.id} className="bg-white p-3 rounded-md">
                      <p className="font-bold">${formatToDollar(bid.amount)}</p>
                      <p className="text-sm">{bid.users.name || "Anonymous"}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(bid.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay pujas por el momento</p>
              )}
            </div>
          </>
        ) : (
          /* Show placeholder when no item featured */
          <div className="lg:w-1/2 p-4 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl text-gray-600 mb-4">
                No hay subasta en vivo actualmente
              </p>
              <p className="text-gray-500">
                Chequea la fecha del próximo vivo en el Home
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
