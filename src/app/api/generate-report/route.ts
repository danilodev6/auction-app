import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { GetAllItemsWithBidsAction } from "@/app/items/manage/actions";
import { Item } from "@/types/items";

export async function GET() {
  try {
    const items: Item[] = await GetAllItemsWithBidsAction(1, 999);

    // Create PDF
    const doc = new jsPDF();

    // Set font and title
    doc.setFontSize(20);
    doc.text("🏆 Reporte de Ganadores de Subasta", 20, 20);

    let yPosition = 40;
    const lineHeight = 6;
    const pageHeight = doc.internal.pageSize.height;

    items.forEach((item: Item, index: number) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      const price = item.currentBid || item.startingPrice;
      const buyer =
        item.auctionType === "direct"
          ? item.soldToName || item.soldToEmail
          : item.bidderName || item.bidderEmail || "Desconocido";
      const email =
        item.auctionType === "direct" ? item.soldToEmail : item.bidderEmail;
      const phone =
        item.auctionType === "direct" ? item.soldToPhone : item.bidderPhone;

      // Item details
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${item.name}`, 20, yPosition);
      yPosition += lineHeight;

      doc.setFontSize(10);
      doc.text(`   Precio final: $${price}`, 20, yPosition);
      yPosition += lineHeight;

      doc.text(`   Comprador: ${buyer}`, 20, yPosition);
      yPosition += lineHeight;

      doc.text(`   Email: ${email || "Sin email"}`, 20, yPosition);
      yPosition += lineHeight;

      doc.text(`   Teléfono: ${phone || "Sin teléfono"}`, 20, yPosition);
      yPosition += lineHeight;

      doc.text(`   Retirado: ________`, 20, yPosition);
      yPosition += lineHeight * 2; // Extra space between items
    });

    // Get PDF as buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=ganadores.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new NextResponse("Error generating PDF", { status: 500 });
  }
}
