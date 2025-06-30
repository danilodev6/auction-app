"use client";

import { useState } from "react";
import { deleteUserById } from "./actions";
import { Button } from "@/components/ui/button";

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
  onSuccess?: () => void;
}

export default function DeleteUserButton({
  userId,
  userName,
  onSuccess,
}: DeleteUserButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUserById(userId);
      onSuccess?.();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user. Please try again.");
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
      <div className="w-full">
        <div className="flex flex-col gap-2 text-center">
          <div className="text-sm text-red-800 font-medium">
            Delete: {userName}?
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 disabled:bg-red-400 text-white px-3 py-1 rounded-md text-sm"
              variant="destructive"
              size="sm"
            >
              {isDeleting ? "Deleting..." : "Yes"}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isDeleting}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowConfirm(true)}
      className="w-full px-4 py-2 rounded-md text-sm"
      variant="destructive"
      size="sm"
    >
      Delete
    </Button>
  );
}
