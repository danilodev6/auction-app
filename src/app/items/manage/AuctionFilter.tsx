"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface AuctionFilterProps {
  auctionTypes: string[];
  totalItems: number;
  filteredCount: number;
}

export default function AuctionFilter({
  auctionTypes,
  totalItems,
  filteredCount,
}: AuctionFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedType = searchParams.get("type") || "";

  const handleFilterChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set("type", value);
      } else {
        params.delete("type");
      }

      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const clearFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("type");
    router.push(`?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="mb-6 flex gap-4 items-center">
      <label htmlFor="auction-filter" className="font-medium">
        Filtrar por tipo:
      </label>

      <select
        id="auction-filter"
        value={selectedType}
        onChange={(e) => handleFilterChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-2 py-2 bg-white"
      >
        <option value="">All types</option>
        {auctionTypes.map((type) => (
          <option key={type} value={type}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </option>
        ))}
      </select>

      {selectedType && (
        <button
          onClick={clearFilter}
          className="text-blue-900 hover:text-blue-700 text-sm underline"
        >
          Clear filter
        </button>
      )}

      <span className="text-sm text-gray-500">
        Showing {filteredCount} of {totalItems} items
      </span>
    </div>
  );
}
