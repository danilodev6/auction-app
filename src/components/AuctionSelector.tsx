"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Item = {
  id: number;
  name: string;
  auctionType: string;
  bidEndTime: Date;
};

export default function AuctionSelector({
  items,
  selectedId,
}: {
  items: Item[];
  selectedId?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter items to only show live and draft auctions
  const liveItems = items.filter((item) => item.auctionType === "live");

  const currentSelectedId = selectedId || searchParams.get("item");

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    if (newId === "none") {
      router.push(`/live`);
    } else {
      router.push(`/live?item=${newId}`);
    }
  };

  const getItemStatus = (item: Item) => {
    if (item.auctionType === "live") {
      const isExpired = new Date(item.bidEndTime) < new Date();
      return isExpired ? " (Ended)" : "";
    }
    return "";
  };

  return (
    <div className="mb-4">
      <label
        htmlFor="auction-selector"
        className="block text-sm font-medium mb-2"
      >
        Select Auction:
      </label>
      <select
        id="auction-selector"
        value={currentSelectedId || "none"}
        onChange={handleSelectChange}
        className="p-2 border rounded w-full"
      >
        <option value="none">No auction selected</option>
        {liveItems.map((item) => (
          <option key={item.id} value={String(item.id)}>
            {item.name}
            {getItemStatus(item)}
          </option>
        ))}
      </select>

      {liveItems.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">
          No live or draft auctions available
        </p>
      )}
    </div>
  );
}
