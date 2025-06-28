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
  // const formatDateTimeLocal = (date: Date) => {
  //   const d = new Date(date);
  //   d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  //   return d.toISOString().slice(0, 16);
  // };

  const isDirectSale = auctionType === "direct";
  const isLiveAuction = auctionType === "live";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full mx-auto px-4 items-stretch">
      <form
        className="p-4 bg-primary rounded-md space-y-4 w-full h-full"
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
            className="block text-sm font-medium text-white"
          >
            Item Nombre
          </label>
          <Input
            id="name"
            required
            className="mt-1"
            name="name"
            type="text"
            placeholder="Nombra tu item"
            defaultValue={item.name}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-white"
          >
            Descripción
          </label>
          <TextArea
            id="description"
            rows={2}
            required
            className="mt-1 rounded-md bg-white"
            name="description"
            placeholder="Describe tu item"
            defaultValue={item.description || ""}
          />
        </div>

        <div>
          <label
            htmlFor="auctionType"
            className="block text-sm font-medium text-white"
          >
            Tipo
          </label>
          <select
            id="auctionType"
            name="auctionType"
            required
            className="mt-1 block w-full bg-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1"
            defaultValue={item.auctionType}
            onChange={handleAuctionTypeChange}
          >
            <option value="regular">Regular Virtual</option>
            <option value="live">Live</option>
            <option value="direct">Venta Directa</option>
            <option value="draft">Draft (Hidden)</option>
          </select>
        </div>

        {/* Only show isFeatured option for live auctions */}
        {auctionType === "live" && (
          <div>
            <label
              htmlFor="isFeatured"
              className="block text-sm font-medium text-white"
            >
              Featured on Live Stream
            </label>
            <select
              id="isFeatured"
              name="isFeatured"
              className="mt-1 block w-full rounded-md bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1"
              defaultValue={item.isFeatured ? "true" : "false"}
            >
              <option value="false">No</option>
              <option value="true">Yes (Feature this item)</option>
            </select>
            <p className="text-xs text-gray-200 mt-1">
              Solo un item puede ser Featured a la vez.
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="startingPrice"
            className="block text-sm font-medium text-white"
          >
            {isDirectSale ? "Precio de venta" : "Precio inicial"}
          </label>
          <Input
            id="startingPrice"
            required
            className="mt-1 rounded-md"
            name="startingPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={item.startingPrice}
            placeholder={
              isDirectSale
                ? "Precio de venta directa"
                : "Precio inicial de tu item"
            }
          />
        </div>

        {/* Only show bid interval for auction types */}
        {!isDirectSale && (
          <div>
            <label
              htmlFor="bidInterval"
              className="block text-sm font-medium text-white"
            >
              Intervalo
            </label>
            <Input
              id="bidInterval"
              type="number"
              name="bidInterval"
              className="mt-1 rounded-md"
              defaultValue={item.bidInterval}
              step="100"
              min="100"
              placeholder="Intervalo de puja de tu item"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="file"
            className="block text-sm font-medium text-white"
          >
            Item Photo{" "}
            {item.imageURL && "(En blanco para conservar la imagen actual)"}
          </label>
          <Input
            id="file"
            type="file"
            name="file"
            accept="image/*"
            className="mt-1 bg-white"
            onChange={handleFileChange}
          />
        </div>

        {/* Only show end time for auction types */}
        {!isDirectSale && !isLiveAuction && (
          <div>
            <label
              htmlFor="bidEndTime"
              className="block text-sm font-medium text-white"
            >
              Finaliza la subasta
            </label>
            <Input
              id="bidEndTime"
              required
              className="mt-1 rounded-md"
              name="bidEndTime"
              type="datetime-local"
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            className="flex-1"
            type="submit"
            variant="secondary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Actualizando..." : "Actualizar"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => router.push("/items/manage")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>

      {imagePreview && (
        <div className="flex items-center justify-center w-full h-full bg-white border rounded-md">
          <div className="relative w-full h-full">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
