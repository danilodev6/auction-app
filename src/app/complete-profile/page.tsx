"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CompleteProfile() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic phone validation
    if (!phone.trim()) {
      setError("Por favor, ingresa tu número de teléfono");
      setIsLoading(false);
      return;
    }

    // Optional: Add more phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      setError("Por favor, ingresa un número de teléfono válido");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/update-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el teléfono");
      }

      // Update the session to include the phone number
      await update();

      // Redirect to the main app
      router.push("/");
    } catch (error) {
      console.error("Error updating phone:", error);
      setError("Error al guardar el número de teléfono. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading if session is still loading
  if (!session) {
    return (
      <div className="flex mt-16 items-center justify-center">
        <div className="text-center">
          {/* <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div> */}
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-indigo-600 animate-loading-bar w-1/2 rounded-full"></div>
          </div>
          <p className="mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mt-16 items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Completa tu perfil
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hola {session.user?.name}, necesitamos tu número de teléfono para
            completar tu registro
          </p>
        </div>

        <form className="mt-4 " onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Número de teléfono
            </label>
            <div className="mt-1">
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border bg-white border-gray-300 placeholder-gray-500 text-gray-900 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Ej: +54 11 1234-5678"
                disabled={isLoading}
              />
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Este número será visible para los administradores si ganas una
              subasta
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="group mt-4 relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded text-white bg-primary hover:bg-accent hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-full mt-4 h-1 bg-indigo-200 rounded overflow-hidden absolute top-0 left-0">
                    <div className="h-full bg-indigo-600 animate-loading-bar w-1/2"></div>
                  </div>
                  Guardando...
                </>
              ) : (
                "Continuar"
              )}
            </Button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Al continuar, aceptas que este número sea usado para contactarte
            sobre tus subastas
          </p>
        </div>
      </div>
    </div>
  );
}
