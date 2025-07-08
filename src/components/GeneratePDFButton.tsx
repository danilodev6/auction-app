"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function GeneratePDFButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      console.log("Requesting PDF generation...");
      const res = await fetch("/api/generate-report");

      console.log("Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("PDF generation failed:", errorText);
        alert(`Error: ${errorText}`);
        return;
      }

      const blob = await res.blob();
      console.log("PDF blob size:", blob.size);

      if (blob.size === 0) {
        console.error("PDF is empty");
        alert("El PDF generado está vacío");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ganadores-subasta.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? "Generando..." : "📄 Descargar PDF"}
    </Button>
  );
}
