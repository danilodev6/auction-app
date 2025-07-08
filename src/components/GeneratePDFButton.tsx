"use client";

import { Button } from "@/components/ui/button";

export default function GeneratePDFButton() {
  const handleGenerate = async () => {
    const res = await fetch("/api/generate-report");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ganadores-subasta.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return <Button onClick={handleGenerate}>📄 Descargar PDF</Button>;
}
