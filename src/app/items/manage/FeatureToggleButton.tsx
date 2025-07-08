"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ToggleFeaturedAction } from "./actions";

interface FeatureToggleButtonProps {
  itemId: number;
  isFeatured: boolean;
  className?: string;
}

export default function FeatureToggleButton({
  itemId,
  isFeatured,
  className,
}: FeatureToggleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [timeoutActive, setTimeoutActive] = useState(false);

  const handleToggle = async () => {
    if (isLoading || timeoutActive) return;

    setIsLoading(true);
    setTimeoutActive(true);

    try {
      await ToggleFeaturedAction(itemId);
    } catch (error) {
      console.error("Error toggling featured status:", error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);

      // Keep the timeout active for 4 seconds
      setTimeout(() => {
        setTimeoutActive(false);
      }, 4000);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading || timeoutActive}
      className={`${className} ${
        isFeatured
          ? "bg-purple-800 hover:bg-purple-700 text-white"
          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
      } ${isLoading || timeoutActive ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isLoading ? "Loading..." : isFeatured ? "Unfeatured" : "Feature"}
      {timeoutActive && !isLoading && " (4s)"}
    </Button>
  );
}
