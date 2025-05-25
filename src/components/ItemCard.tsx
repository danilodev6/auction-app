import { Item } from "@/db/schema";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { formatToDollar } from "@/util/currency";

export function ItemCard({ item }: { item: Item }) {
  return (
    <div className="flex flex-col items-center p-4 border rounded-lg shadow-md">
      <div className="relative w-full h-48 mb-4 bg-gray-100 rounded-lg overflow-hidden">
        {item.imageURL ? (
          <Image
            src={item.imageURL}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image available
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold">{item.name}</h3>
      <p className="text-gray-700">
        Starting Price: $ {formatToDollar(item.startingPrice)}
      </p>

      <Button asChild className="mt-4">
        <Link href={`/items/${item.id}`}>See item</Link>
      </Button>
    </div>
  );
}
