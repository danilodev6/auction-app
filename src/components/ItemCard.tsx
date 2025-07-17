import { Item } from "@/db/schema";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { formatSimpleDate } from "@/util/date2";

export function ItemCard({ item }: { item: Item }) {
  const isDirectSale = item.auctionType === "direct";
  const isSold = isDirectSale && item.status !== "active";

  return (
    <div className="flex flex-col h-[295px] w-48 px-3 items-center rounded-md shadow-md bg-card text-card-foreground border-border">
      <div className="relative w-48 h-48 rounded-md overflow-hidden z-10 mt-1.5">
        {item.imageURL ? (
          <Image
            src={item.imageURL}
            alt={item.name}
            fill
            className="object-fit rounded"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image available
          </div>
        )}

        {isSold && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
            VENDIDO
          </div>
        )}
      </div>

      <p className="text-lg font-semibold text-center px-2 leading-tight">
        {item.name}
      </p>
      {isDirectSale ? (
        <p className="text-sm text-gray-500 text-center">
          {isSold ? "Producto vendido" : "Ingresa para comprar"}
        </p>
      ) : (
        <p className="text-sm text-gray-500 text-center">
          Finaliza: {formatSimpleDate(item.bidEndTime)}
        </p>
      )}

      <Button asChild className="m-2" disabled={isSold}>
        <Link href={`/items/${item.id}`}>
          {item.auctionType === "direct" ? "Comprar aquí" : "Pujar aquí"}
        </Link>
      </Button>
    </div>
  );
}
