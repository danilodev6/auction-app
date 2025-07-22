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

  const handleImageError = () => {
    console.error("Dashboard image failed to load:", src);
    setImageError(true);
  };

  const optimizedSrc =
    getOptimizedImageUrl(src, {
      width,
      height,
      format: "auto",
      crop: "fill",
    }) ||
    getImageKitUrl(src) ||
    src;

  if (imageError || !src) {
    return (
      <div
        className={`bg-gray-200 rounded-md flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-xs">No Image</span>
      </div>
    );
  }

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      onError={handleImageError}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
}
