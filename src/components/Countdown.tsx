"use client";

import { useEffect, useState } from "react";

export function Countdown({ endTime }: { endTime: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setRemaining("Auction ended");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown(); // run immediately

    const interval = setInterval(updateCountdown, 1000); // then every second
    return () => clearInterval(interval);
  }, [endTime]);

  return <span className="text-red-600 font-bold">{remaining}</span>;
}
