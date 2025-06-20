"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateItemAction } from "./actions";
import { useState } from "react";
import Image from "next/image";
import { TextArea } from "@/components/ui/textarea";

export default function CreateItemForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auctionType, setAuctionType] = useState("regular");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleAuctionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAuctionType(e.target.value);
  };

  const isDirectSale = auctionType === "direct";
  const isLiveAuction = auctionType === "live";

  return (
    <div className="grid grid-cols-2 w-full h-96">
      <form
        className="border p-4 mt-2 rounded-md space-y-4 max-w-lg"
        onSubmit={async (e) => {
          e.preventDefault();
          setIsSubmitting(true);
          try {
            const form = e.currentTarget as HTMLFormElement;
            const formData = new FormData(form);

            // For direct sales, we don't need an end time, but we'll set it far in the future
            if (isDirectSale || isLiveAuction) {
              const futureDate = new Date();
              futureDate.setFullYear(futureDate.getFullYear() + 10);
              formData.set("bidEndTime", futureDate.toISOString());
            } else {
              const localDateStr = formData.get("bidEndTime")?.toString();
              if (localDateStr) {
                const localDate = new Date(localDateStr);
                const isoString = localDate.toISOString();
                formData.set("bidEndTime", isoString);
              }
            }

            await CreateItemAction(formData);

            // Reset form
            form.reset();
            setImagePreview(null);
            setAuctionType("regular");
          } catch (error) {
            console.error("Error creating item:", error);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Item Name
          </label>
          <Input
            id="name"
            required
            className="mt-1"
            name="name"
            type="text"
            placeholder="Name your item"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Item Description
          </label>
          <TextArea
            id="description"
            rows={2}
            required
            className="mt-1"
            name="description"
            placeholder="Describe your item"
          />
        </div>

        <div>
          <label
            htmlFor="auctionType"
            className="block text-sm font-medium text-gray-700"
          >
            Sale Type
          </label>
          <select
            id="auctionType"
            name="auctionType"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1"
            value={auctionType}
            onChange={handleAuctionTypeChange}
          >
            <option value="regular">Regular Auction</option>
            <option value="live">Live Auction</option>
            <option value="direct">Direct Sale</option>
            <option value="draft">Draft (Hidden)</option>
          </select>
        </div>

        {/* Only show isFeatured option for live auctions */}
        {auctionType === "live" && (
          <div>
            <label
              htmlFor="isFeatured"
              className="block text-sm font-medium text-gray-700"
            >
              Featured on Live Stream
            </label>
            <select
              id="isFeatured"
              name="isFeatured"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1"
              defaultValue="false"
            >
              <option value="false">No</option>
              <option value="true">Yes (Feature this item)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Only one item can be featured at a time.
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="startingPrice"
            className="block text-sm font-medium text-gray-700"
          >
            {isDirectSale ? "Sale Price ($)" : "Starting Price ($)"}
          </label>
          <Input
            id="startingPrice"
            required
            className="mt-1"
            name="startingPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder={
              isDirectSale
                ? "Price for direct sale"
                : "Starting Price of your item"
            }
          />
        </div>

        {/* Only show bid interval for auction types */}
        {!isDirectSale && (
          <div>
            <label
              htmlFor="bidInterval"
              className="block text-sm font-medium text-gray-700"
            >
              Bid Interval
            </label>
            <Input
              id="bidInterval"
              type="number"
              name="bidInterval"
              step="100"
              min="100"
              placeholder="Bid Interval of your item"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700"
          >
            Item Photo
          </label>
          <Input
            id="file"
            type="file"
            name="file"
            accept="image/*"
            className="mt-1"
            onChange={handleFileChange}
          />
        </div>

        {/* Only show end time for auction types */}
        {!isDirectSale && !isLiveAuction && (
          <div>
            <label
              htmlFor="bidEndTime"
              className="block text-sm font-medium text-gray-700"
            >
              Auction End Date
            </label>
            <Input
              id="bidEndTime"
              required
              className="mt-1"
              name="bidEndTime"
              type="datetime-local"
            />
          </div>
        )}

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Item"}
        </Button>
      </form>

      {imagePreview && (
        <div className="relative max-w-lg mt-4 border rounded-md overflow-hidden">
          <Image
            src={imagePreview}
            alt="Preview"
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}
