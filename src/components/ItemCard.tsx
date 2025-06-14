import { Item } from "@/db/schema";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { formatToDollar } from "@/util/currency";
import { formatDate } from "@/util/date";

export function ItemCard({ item }: { item: Item }) {
  return (
    <div className="flex flex-col items-center p-4 border rounded-lg shadow-md">
      <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
        {item.imageURL ? (
          <Image
            src={item.imageURL}
            alt={item.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image available
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold">{item.name}</h3>
      <p className="text-gray-700 mt-1">
        Starting Price: $ {formatToDollar(item.startingPrice)}
      </p>
      <p className="text-gray-500 mt-1">
        Ending: {formatDate(item.bidEndTime)}
      </p>

      <Button asChild className="mt-4">
        <Link href={`/items/${item.id}`}>See item</Link>
      </Button>
    </div>
  );
}
