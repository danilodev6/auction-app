"use client";

import Image from "next/image";
import { useState } from "react";

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

  // If there's an error or no src, show fallback
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
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      onError={handleImageError}
      onLoad={() => {
        if (process.env.NODE_ENV === "development") {
          console.log("✅ Dashboard image loaded successfully:", src);
        }
      }}
      // Add these props to help with loading
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
}
