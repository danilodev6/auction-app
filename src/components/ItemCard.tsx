"use client";

import { Item } from "@/db/schema";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { formatSimpleDate } from "@/util/date2";
import { useState } from "react";
import { getImageKitUrl, getOptimizedImageUrl } from "@/lib/imagekit";

export function ItemCard({ item }: { item: Item }) {
  const isDirectSale = item.auctionType === "direct";
  const isSold = isDirectSale && item.status !== "active";
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");

  // Get optimized Cloudinary URL
  const optimizedImageUrl = getOptimizedImageUrl(item.imageURL, {
    width: 384,
    height: 384,
    format: "auto",
    crop: "fill",
  });

  // Fallback to basic Cloudinary URL
  const basicCloudinaryUrl = getImageKitUrl(item.imageURL);

  // Initialize image URL
  const initialImageUrl =
    optimizedImageUrl || basicCloudinaryUrl || item.imageURL;

  const handleImageError = () => {
    console.error("Image failed to load:", currentImageUrl || initialImageUrl);

    if (!currentImageUrl) {
      if (basicCloudinaryUrl && basicCloudinaryUrl !== initialImageUrl) {
        console.log("Trying basic Cloudinary URL:", basicCloudinaryUrl);
        setCurrentImageUrl(basicCloudinaryUrl);
        return;
      }
    }

    if (currentImageUrl === basicCloudinaryUrl) {
      if (item.imageURL && item.imageURL !== currentImageUrl) {
        console.log("Trying original Supabase URL:", item.imageURL);
        setCurrentImageUrl(item.imageURL);
        return;
      }
    }

    console.error("All image URLs failed");
    setImageError(true);
  };

  const finalImageUrl = currentImageUrl || initialImageUrl;

  return (
    <div className="flex flex-col h-[295px] w-54 px-3 items-center rounded-md shadow-md bg-card text-card-foreground border-border">
      <div className="relative w-48 h-48 rounded-md overflow-hidden z-10 mt-1.5">
        {!imageError && finalImageUrl ? (
          <Image
            src={finalImageUrl}
            alt={item.name}
            fill
            className="object-cover rounded"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={item.isFeatured}
            onError={handleImageError}
            onLoad={() => {
              if (process.env.NODE_ENV === "development") {
                console.log("✅ Image loaded successfully:", finalImageUrl);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 rounded">
            <div className="text-center">
              <div className="text-2xl mb-2">📷</div>
              <div className="text-xs">No image available</div>
            </div>
          </div>
        )}

        {isSold && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
            VENDIDO
          </div>
        )}
      </div>

      <p className="text-lg font-semibold text-center px-2 leading-tight">
        {item.name}
      </p>
      {isDirectSale ? (
        <p className="text-sm text-gray-500 text-center">
          {isSold ? "Producto vendido" : "Ingresa para comprar"}
        </p>
      ) : (
        <p className="text-sm text-gray-500 text-center">
          Finaliza: {formatSimpleDate(item.bidEndTime)}
        </p>
      )}

      <Button asChild className="m-2" disabled={isSold}>
        <Link href={`/items/${item.id}`}>
          {item.auctionType === "direct" ? "Comprar aquí" : "Pujar aquí"}
        </Link>
      </Button>
    </div>
  );
}
