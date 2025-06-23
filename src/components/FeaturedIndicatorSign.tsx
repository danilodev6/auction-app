"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/util/date";
import { formatSimpleDate } from "@/util/date2";

interface FeaturedIndicatorSignProps {
  userIsAdmin: boolean;
  initialDate?: string | null;
}

export function FeaturedIndicatorSign({
  userIsAdmin,
  initialDate,
}: FeaturedIndicatorSignProps) {
  const [nextLiveDate, setNextLiveDate] = useState(initialDate || "");
  const [isSaving, setIsSaving] = useState(false);

  const saveDate = async (dateValue: string | null) => {
    if (!userIsAdmin) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/next-live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nextLive: dateValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save date");
      }
    } catch (error) {
      console.error("Error saving next live date:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setNextLiveDate("");
    await saveDate(null);
  };

  return (
    <div className="fixed bottom-25 right-25 z-50 rounded-md bg-primary shadow-lg p-3">
      <p className="text-lg font-semibold text-white">El próximo vivo es:</p>

      {userIsAdmin ? (
        <div className="space-y-2">
          <p className="text-xl text-center text-white">
            {nextLiveDate ? formatSimpleDate(nextLiveDate) : "No programado"}
          </p>

          <label htmlFor="nextLive" className="block text-md text-accent">
            Seleccionar fecha
          </label>
          <Input
            id="nextLive"
            type="datetime-local"
            value={nextLiveDate}
            onChange={(e) => setNextLiveDate(e.target.value)}
            className="text-md bg-white mb-4"
            disabled={isSaving}
          />
          <div className="flex justify-center gap-2 mt-1">
            <Button
              onClick={() => saveDate(nextLiveDate || null)}
              disabled={isSaving}
              variant="secondary"
            >
              Guardar
            </Button>
            <Button
              onClick={handleReset}
              variant="secondary"
              disabled={isSaving}
            >
              Quitar fecha
            </Button>
          </div>
          {isSaving && <p className="text-md text-accent">Guardando...</p>}
        </div>
      ) : nextLiveDate ? (
        <div>
          <p className="text-xl text-center text-white">
            {formatDate(nextLiveDate)}
          </p>
          <hr className="mx-auto w-1/2 my-1" />
          <p className="text-xl text-center text-white">
            {formatSimpleDate(nextLiveDate)}
          </p>
        </div>
      ) : (
        <p className="text-xl text-center text-white">No programado</p>
      )}
    </div>
  );
}
