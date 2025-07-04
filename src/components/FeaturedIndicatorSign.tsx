"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/util/date";
import { formatSimpleDate } from "@/util/date2";
import { motion } from "motion/react";

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
    <motion.div
      initial={{ x: 450 }}
      animate={{ x: 0 }}
      transition={{ duration: 1.3, ease: "easeOut", delay: 0.8 }}
      className="relative mx-auto mt-6 mb-4 max-w-sm lg:fixed lg:bottom-20 lg:right-20 lg:max-w-none z-30 rounded-md bg-accent shadow-lg p-3"
    >
      <p className="text-lg text-center font-semibold text-primary">
        El próximo VIVO es:
      </p>

      {userIsAdmin ? (
        <div className="space-y-2">
          <p className="text-xl text-center text-primary">
            {nextLiveDate ? formatSimpleDate(nextLiveDate) : "No programado"}
          </p>

          <label
            htmlFor="nextLive"
            className="block text-center text-md text-primary"
          >
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
              variant="light"
            >
              Guardar
            </Button>
            <Button onClick={handleReset} disabled={isSaving} variant="light">
              Quitar fecha
            </Button>
          </div>
          {isSaving && <p className="text-md text-primary">Guardando...</p>}
        </div>
      ) : nextLiveDate ? (
        <div>
          <p className="text-xl text-center text-primary">
            {formatDate(nextLiveDate)}
          </p>
          <hr className="mx-auto w-1/2 my-1" />
          <p className="text-xl text-center text-primary">
            {formatSimpleDate(nextLiveDate)}
          </p>
        </div>
      ) : (
        <p className="text-xl text-center text-primary">No programado</p>
      )}
    </motion.div>
  );
}
