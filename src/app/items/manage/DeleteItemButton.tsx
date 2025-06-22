"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteItemAction } from "./actions";
import { Button } from "@/components/ui/button";

interface DeleteItemButtonProps {
  itemId: number;
  itemName: string;
}

export default function DeleteItemButton({
  itemId,
  itemName,
}: DeleteItemButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await DeleteItemAction(itemId);
      // The action already handles revalidation, so we just need to refresh
      router.refresh();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2 text-center">
        <div className="text-sm text-red-800 font-medium">
          Delete {itemName}?
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-800 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1 rounded text-sm"
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isDeleting}
            className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowConfirm(true)}
      className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
    >
      Delete
    </Button>
  );
}
