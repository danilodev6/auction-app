"use client";

import Image from "next/image";
import { useState } from "react";
import { getImageKitUrl, getOptimizedImageUrl } from "@/lib/imagekit";

interface DashboardImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
}

export function DashboardImage({
  src,
  alt,
  width,
  height,
  className = "",
  sizes = "80px",
}: DashboardImageProps) {
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");

  // Get optimized ImageKit URL
  const optimizedImageUrl = getOptimizedImageUrl(src, {
    width,
    height,
    format: "auto",
    crop: "fill",
  });

  // Fallback to basic ImageKit URL
  const basicImageKitUrl = getImageKitUrl(src);

  // Initialize image URL
  const initialImageUrl = optimizedImageUrl || basicImageKitUrl || src;

  const handleImageError = () => {
    console.error(
      "Dashboard image failed to load:",
      currentImageUrl || initialImageUrl,
    );

    if (!currentImageUrl) {
      if (basicImageKitUrl && basicImageKitUrl !== initialImageUrl) {
        console.log("Trying basic ImageKit URL:", basicImageKitUrl);
        setCurrentImageUrl(basicImageKitUrl);
        return;
      }
    }

    if (currentImageUrl === basicImageKitUrl) {
      if (src && src !== currentImageUrl) {
        console.log("Trying original Supabase URL:", src);
        setCurrentImageUrl(src);
        return;
      }
    }

    console.error("All dashboard image URLs failed");
    setImageError(true);
  };

  const finalImageUrl = currentImageUrl || initialImageUrl;

  if (imageError || !finalImageUrl) {
    return (
      <div
        className={`bg-gray-200 rounded-md flex items-center justify-center ${className}`}
      >
        <span className="text-gray-400 text-xs">No Image</span>
      </div>
    );
  }

  return (
    <Image
      src={finalImageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      onError={handleImageError}
      onLoad={() => {
        if (process.env.NODE_ENV === "development") {
          console.log("✅ Dashboard image loaded successfully:", finalImageUrl);
        }
      }}
    />
  );
}
