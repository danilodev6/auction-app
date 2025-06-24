// hooks/useClientOnly.ts
import { useEffect, useState } from "react";
import type Pusher from "pusher-js";

export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

// Alternative: More specific hook for Pusher with proper typing
export function usePusher() {
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const isClient = useClientOnly();

  useEffect(() => {
    if (!isClient) return;

    import("pusher-js").then((pusherModule) => {
      const PusherClass = pusherModule.default;
      const pusherInstance = new PusherClass(
        process.env.NEXT_PUBLIC_PUSHER_KEY!,
        {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        },
      );
      setPusher(pusherInstance);
    });

    return () => {
      if (pusher) {
        pusher.disconnect();
      }
    };
  }, [isClient, pusher]);

  return { pusher, isClient };
}
