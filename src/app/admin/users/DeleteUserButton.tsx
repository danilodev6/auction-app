"use client";

import { useState } from "react";
import { deleteUserById } from "./actions"; // your server action
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
      <div className="flex flex-col gap-2 text-center">
        <div className="text-sm text-red-800 font-medium">
          Delete: {userName}?
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="disabled:bg-red-400 text-white px-3 py-1 rounded-md text-sm"
            variant="destructive"
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isDeleting}
            className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm"
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
      className="px-4 py-2 rounded-md text-sm"
      variant="destructive"
    >
      Delete
    </Button>
  );
}
