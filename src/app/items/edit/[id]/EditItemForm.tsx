"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UpdateItemAction } from "../../manage/actions";
import { useState } from "react";
import Image from "next/image";
import { TextArea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

interface Item {
  id: number;
  name: string;
  description: string | null;
  startingPrice: number;
  bidInterval: number;
  bidEndTime: Date;
  auctionType: string;
  imageURL: string | null;
  isFeatured: boolean;
}

interface EditItemFormProps {
  item: Item;
}

export default function EditItemForm({ item }: EditItemFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    item.imageURL,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auctionType, setAuctionType] = useState(item.auctionType);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuctionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAuctionType(e.target.value);
  };

  // Format date for datetime-local input
  const formatDateTimeLocal = (date: Date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  return (
    <div className="grid grid-cols-2 w-full h-96">
      <form
        className="border p-4 mt-4 rounded-md space-y-4 max-w-lg"
        onSubmit={async (e) => {
          e.preventDefault();
          setIsSubmitting(true);
          try {
            const form = e.currentTarget as HTMLFormElement;
            const formData = new FormData(form);

            const localDateStr = formData.get("bidEndTime")?.toString();
            if (localDateStr) {
              const localDate = new Date(localDateStr);
              const isoString = localDate.toISOString();
              formData.set("bidEndTime", isoString);
            }

            await UpdateItemAction(item.id, formData);

            // Redirect to manage page after successful update
            router.push("/items/manage");
          } catch (error) {
            console.error("Error updating item:", error);
            alert("Error updating item. Please try again.");
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
            defaultValue={item.name}
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
            rows={3}
            required
            className="mt-1"
            name="description"
            placeholder="Describe your item"
            defaultValue={item.description || ""}
          />
        </div>

        <div>
          <label
            htmlFor="auctionType"
            className="block text-sm font-medium text-gray-700"
          >
            Auction Type
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
              defaultValue={item.isFeatured ? "true" : "false"}
            >
              <option value="false">No</option>
              <option value="true">Yes (Feature this item)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Only one item can be featured at a time. Selecting YES will
              unfeatured any currently featured item.
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="startingPrice"
            className="block text-sm font-medium text-gray-700"
          >
            Starting Price ($)
          </label>
          <Input
            id="startingPrice"
            required
            className="mt-1"
            name="startingPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="Starting Price of your item"
            defaultValue={item.startingPrice}
          />
        </div>

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
            defaultValue={item.bidInterval}
          />
        </div>

        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-700"
          >
            Item Photo {item.imageURL && "(Leave blank to keep current image)"}
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
            defaultValue={formatDateTimeLocal(item.bidEndTime)}
          />
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Item"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/items/manage")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
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
