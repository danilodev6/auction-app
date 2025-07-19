"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

interface ItemSearchProps {
  totalItems: number;
  filteredCount: number;
}

export default function ItemSearch({
  totalItems,
  filteredCount,
}: ItemSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );

  // Use a ref to track the previous search term
  const prevSearchTermRef = useRef(searchTerm);

  // Update URL when search term changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      const trimmedSearchTerm = searchTerm.trim();
      const prevSearchTerm = prevSearchTermRef.current;

      if (trimmedSearchTerm) {
        params.set("search", trimmedSearchTerm);
      } else {
        params.delete("search");
      }

      // Only reset to first page when the search term actually changes
      if (trimmedSearchTerm !== prevSearchTerm) {
        params.set("page", "1");
      }

      // Update the ref to the current search term
      prevSearchTermRef.current = trimmedSearchTerm;

      router.push(`?${params.toString()}`, { scroll: false });
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, router, searchParams]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="mb-4 space-y-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          {searchTerm ? (
            <>
              Mostrando {filteredCount} de {totalItems} items
              {searchTerm && (
                <span className="font-medium"> para `{searchTerm}`</span>
              )}
            </>
          ) : (
            <>Total: {totalItems} items</>
          )}
        </span>

        {searchTerm && (
          <button
            onClick={clearSearch}
            className="text-blue-600 hover:text-blue-800 text-xs underline"
          >
            Limpiar búsqueda
          </button>
        )}
      </div>
    </div>
  );
}
