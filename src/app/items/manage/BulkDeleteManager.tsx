"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteItemAction } from "./actions";
import { Button } from "@/components/ui/button";

interface BulkDeleteManagerProps {
  children: React.ReactNode;
  totalItems: number;
  allItemIds: number[];
  onSelectionChange?: (selectedItems: Set<number>) => void;
}

// Create a context for bulk selection
import { createContext, useContext } from "react";

interface BulkSelectionContextType {
  selectedItems: Set<number>;
  toggleItem: (itemId: number) => void;
  toggleAll: () => void;
  isAllSelected: boolean;
  hasSelection: boolean;
  isItemSelected: (itemId: number) => boolean;
}

const BulkSelectionContext = createContext<BulkSelectionContextType | null>(
  null,
);

export function useBulkSelection() {
  const context = useContext(BulkSelectionContext);
  if (!context) {
    throw new Error("useBulkSelection must be used within a BulkDeleteManager");
  }
  return context;
}

export default function BulkDeleteManager({
  children,
  totalItems,
  allItemIds,
  onSelectionChange,
}: BulkDeleteManagerProps) {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const toggleItem = (itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    onSelectionChange?.(newSelected);
  };

  const toggleAll = () => {
    const newSelected =
      selectedItems.size === totalItems
        ? new Set<number>()
        : new Set(allItemIds);
    setSelectedItems(newSelected);
    onSelectionChange?.(newSelected);
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete items in parallel for better performance
      const deletePromises = Array.from(selectedItems).map((itemId) =>
        DeleteItemAction(itemId),
      );

      await Promise.all(deletePromises);

      setSelectedItems(new Set());
      setShowConfirm(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting items:", error);
      alert("Error deleting some items. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isAllSelected = selectedItems.size === totalItems && totalItems > 0;
  const hasSelection = selectedItems.size > 0;
  const isItemSelected = (itemId: number) => selectedItems.has(itemId);

  const contextValue: BulkSelectionContextType = {
    selectedItems,
    toggleItem,
    toggleAll,
    isAllSelected,
    hasSelection,
    isItemSelected,
  };

  const bulkDeleteComponent = hasSelection ? (
    <div className="mb-1 p-2 bg-red-50 border border-red-200 rounded">
      <div className="flex items-center justify-between">
        <span className="text-red-800 font-medium">
          {selectedItems.size} item{selectedItems.size > 1 ? "s" : ""} selected
        </span>

        {!showConfirm ? (
          <div className="flex gap-2">
            <Button
              onClick={() => setSelectedItems(new Set())}
              className=" rounded text-sm"
            >
              Clear selection
            </Button>
            <Button
              onClick={() => setShowConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Delete Selected ({selectedItems.size})
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-red-800 text-sm">
              Are you sure you want to delete {selectedItems.size} items?
            </span>
            <div className="flex gap-2">
              <Button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="bg-red-800 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1 rounded text-sm"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </Button>
              <Button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <BulkSelectionContext.Provider value={contextValue}>
      {bulkDeleteComponent}
      {children}
    </BulkSelectionContext.Provider>
  );
}

// Helper components for easier usage
export function SelectAllCheckbox({ itemCount }: { itemCount: number }) {
  const { isAllSelected, toggleAll, hasSelection, selectedItems } =
    useBulkSelection();

  return (
    <div className="mb-2 flex items-center gap-3 p-2 bg-white rounded-md">
      <input
        type="checkbox"
        checked={isAllSelected}
        onChange={toggleAll}
        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
      />
      <span className="text-sm font-medium text-gray-700">
        Select All ({itemCount} items)
      </span>
      {hasSelection && (
        <span className="text-sm text-blue-600">
          {selectedItems.size} selected
        </span>
      )}
    </div>
  );
}

export function ItemCheckbox({ itemId }: { itemId: number }) {
  const { isItemSelected, toggleItem } = useBulkSelection();

  return (
    <input
      type="checkbox"
      checked={isItemSelected(itemId)}
      onChange={() => toggleItem(itemId)}
      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
    />
  );
}
