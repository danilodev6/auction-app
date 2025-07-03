import { useEffect, useState } from "react";
import type Pusher from "pusher-js";

interface PusherHookReturn {
  pusher: Pusher | null;
  isReady: boolean;
}

type Bid = {
  id: number;
  amount: number;
  timestamp: Date;
  users: {
    name: string | null;
  };
};

export function usePusherClient(): PusherHookReturn {
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let pusherInstance: Pusher;

    const initializePusher = async () => {
      try {
        const { default: PusherClass } = await import("pusher-js");
        pusherInstance = new PusherClass(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        setPusher(pusherInstance);
        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize Pusher:", error);
      }
    };

    initializePusher();

    return () => {
      if (pusherInstance) {
        pusherInstance.disconnect();
      }
    };
  }, []);

  return { pusher, isReady };
}

// Usage in your component:
export function useLiveAuction(itemId?: number) {
  const { pusher, isReady } = usePusherClient();
  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    if (!pusher || !isReady || !itemId) return;

    const channel = pusher.subscribe(`item-${itemId}`);

    channel.bind("new-bid", (data: { bid: Bid; currentBid: number }) => {
      setBids((prev) => {
        const exists = prev.some((b) => b.id === data.bid.id);
        return exists ? prev : [data.bid, ...prev];
      });
    });

    return () => {
      pusher.unsubscribe(`item-${itemId}`);
    };
  }, [pusher, isReady, itemId]);

  return { bids, setBids };
}
