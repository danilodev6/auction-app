import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { Readable } from "stream";
import { GetAllItemsWithBidsAction } from "@/app/items/manage/actions";
import { Item } from "@/types/items";

export async function GET() {
  const items = await GetAllItemsWithBidsAction(1, 999); // todos los ítems
  const doc = new PDFDocument();
  const stream = Readable.from(doc);

  doc.fontSize(20).text("Reporte de ganadores de subasta", { align: "center" });
  doc.moveDown();

  items.forEach((item: Item, index: number) => {
    const name = item.name;
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
      .text(`${index + 1}. ${name}`, { continued: true })
      .text(` - $${price}`, { continued: true })
      .text(` - ${buyer}`, { continued: true })
      .text(` - ${email}`, { continued: true })
      .text(` - ${phone || "Sin teléfono"}`);

    doc.moveDown();
  });

  doc.end();

  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=ganadores.pdf",
    },
  });
}
