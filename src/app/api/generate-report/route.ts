import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { GetAllItemsWithBidsAction } from "@/app/items/manage/actions";
import { Item } from "@/types/items";

function createPDFBuffer(items: Item[]): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const chunks: Uint8Array[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const result = Buffer.concat(chunks);
      resolve(result);
    });

    doc.fontSize(20).text("🏆 Reporte de Ganadores de Subasta", {
      align: "center",
    });

    doc.moveDown();

    items.forEach((item: Item, index: number) => {
      const price = item.currentBid || item.startingPrice;
      const buyer =
        item.auctionType === "direct"
          ? item.soldToName || item.soldToEmail
          : item.bidderName || item.bidderEmail || "Desconocido";
      const email =
        item.auctionType === "direct" ? item.soldToEmail : item.bidderEmail;
      const phone =
        item.auctionType === "direct" ? item.soldToPhone : item.bidderPhone;

      doc
        .fontSize(12)
        .text(`${index + 1}. ${item.name}`)
        .text(`   Precio final: $${price}`)
        .text(`   Comprador: ${buyer}`)
        .text(`   Email: ${email}`)
        .text(`   Teléfono: ${phone || "Sin teléfono"}`)
        .text(`   Retirado: ________`)
        .moveDown();
    });

    doc.end();
  });
}

export async function GET() {
  const items: Item[] = await GetAllItemsWithBidsAction(1, 999);

  const buffer = await createPDFBuffer(items);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=ganadores.pdf",
    },
  });
}
