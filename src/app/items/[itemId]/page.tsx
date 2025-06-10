import { getItem } from "@/data-access/items";
import { getBids } from "@/data-access/bids";
import { auth } from "@/auth";
import ItemPageClient from "./page";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default async function ItemPageWrapper({
  params,
}: {
  params: { itemId: string };
}) {
  const session = await auth();
  const item = await getItem(parseInt(params.itemId));

  if (!item) {
    return (
      <div className="container flex flex-col items-center mx-auto py-12">
        <h1 className="text-4xl font-bold">Item not found</h1>
        <p className="mt-4">The item you're looking for doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link href="/">Browse Items</Link>
        </Button>
        <Image
          className="mt-8 mx-auto"
          src="/package.svg"
          alt="Empty State"
          width={500}
          height={500}
        />
      </div>
    );
  }

  const initialBids = await getBids(item.id);

  return (
    <ItemPageClient
      initialItem={{
        ...item,
        bidEndTime: new Date(item.bidEndTime),
      }}
      initialBids={initialBids.map((bid) => ({
        ...bid,
        timestamp: new Date(bid.timestamp),
      }))}
      isSignedIn={!!session?.user?.id}
    />
  );
}
