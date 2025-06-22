import { Item } from "@/db/schema";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { formatDate } from "@/util/date";

export function ItemCard({ item }: { item: Item }) {
  return (
    <div className="flex flex-col px-3 items-center rounded shadow-md bg-card text-card-foreground border-border">
      <div className="relative w-48 h-48 rounded overflow-hidden z-10 mt-2">
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

      <h3 className="text-lg font-semibold">{item.name}</h3>
      {/* <p className="text-gray-700 mt-1"> */}
      {/*   Starting Price: $ {formatToDollar(item.startingPrice)} */}
      {/* </p> */}
      {item.auctionType === "direct" ? (
        <p className="text-gray-500">Ingresa para comprar</p>
      ) : (
        <p className="text-gray-500">Finaliza: {formatDate(item.bidEndTime)}</p>
      )}

      <Button
        asChild
        className="m-2 bg-primary text-primary-foreground px-4 py-1 rounded hover:bg-accent hover:text-accent-foreground"
      >
        <Link href={`/items/${item.id}`}>See item</Link>
      </Button>
    </div>
  );
}
