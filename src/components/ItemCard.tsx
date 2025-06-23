import { Item } from "@/db/schema";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { formatDate } from "@/util/date";

export function ItemCard({ item }: { item: Item }) {
  return (
    <div className="flex flex-col h-[295px] px-3 items-center rounded shadow-md bg-card text-card-foreground border-border">
      <div className="relative w-48 h-48 rounded overflow-hidden z-10 mt-1.5">
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
      </div>

      <p className="text-lg font-semibold">{item.name}</p>
      {item.auctionType === "direct" ? (
        <p className="text-sm text-gray-500">Ingresa para comprar</p>
      ) : (
        <p className="text-sm text-gray-500">
          Finaliza: {formatDate(item.bidEndTime)}
        </p>
      )}

      <Button asChild className="m-2">
        <Link href={`/items/${item.id}`}>See item</Link>
      </Button>
    </div>
  );
}
