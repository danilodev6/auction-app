import { redirect } from "next/navigation";
import { auth, isAdmin } from "@/auth";
import Link from "next/link";
import Image from "next/image";
import { GetAllItemsWithBidsAction, ToggleFeaturedAction } from "./actions";
import DeleteItemButton from "./DeleteItemButton";
import { formatToDollar } from "@/util/currency";
import AuctionFilter from "./AuctionFilter";
import BulkDeleteManager, {
  SelectAllCheckbox,
  ItemCheckbox,
} from "./BulkDeleteManager";

type AuctionType = "regular" | "live" | "draft" | "direct";

interface Item {
  id: number;
  name: string;
  description: string | null;
  startingPrice: number;
  currentBid: number | null;
  bidInterval: number;
  bidEndTime: Date;
  auctionType: string;
  imageURL: string | null;
  isFeatured: boolean;
  totalBids: number;
  bidderName: string | null;
  bidderEmail: string | null;
  bidTime: Date | null;
  status: string;
}

interface PageProps {
  searchParams: Promise<{
    type?: string;
  }>;
}

export default async function ManageItemsPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session || !(await isAdmin(session))) {
    redirect("/");
  }

  const items = await GetAllItemsWithBidsAction();

  // Sort items consistently by ID to maintain original order (no featured reordering)
  const sortedItems = items.sort((a, b) => {
    return a.id - b.id; // Assuming ID is numeric, use a.id.localeCompare(b.id) if string
  });

  // Filter items based on search params
  const resolvedSearchParams = await searchParams;
  const selectedType = resolvedSearchParams.type as AuctionType | undefined;
  const filteredItems = selectedType
    ? sortedItems.filter((item) => item.auctionType === selectedType)
    : sortedItems;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusBadge = (
    auctionType: string,
    endTime: Date,
    isFeatured: boolean,
    status: string,
  ) => {
    const now = new Date();
    const isExpired = now > new Date(endTime);
    const statusSale = status;

    let statusText = auctionType;
    let statusColor = "bg-gray-500";

    if (auctionType === "draft") {
      statusColor = "bg-gray-500";
    } else if (auctionType === "live") {
      if (isFeatured) {
        statusColor = "bg-purple-700";
        statusText = "🔴 FEATURED LIVE";
      } else {
        statusColor = isExpired ? "bg-red-900" : "bg-green-900";
        statusText = isExpired ? "live (ended)" : "live (active)";
      }
    } else if (auctionType === "regular") {
      statusColor = isExpired ? "bg-red-900" : "bg-blue-800";
      statusText = isExpired ? "regular (ended)" : "regular (active)";
    } else if (auctionType === "direct") {
      statusColor = statusSale === "active" ? "bg-yellow-500" : "bg-red-900";
      statusText =
        statusSale === "active" ? "direct (active)" : "direct (sold)";
    }

    return (
      <span className={`px-2 py-1 rounded text-white text-xs ${statusColor}`}>
        {statusText}
      </span>
    );
  };

  const getBidStatusInfo = (item: Item) => {
    if (!item.currentBid) {
      return {
        display: "Sin pujas",
        amount: formatToDollar(item.startingPrice),
        color: "text-gray-500",
      };
    }

    return {
      display: `${item.totalBids} puja${item.totalBids > 1 ? "s" : ""}`,
      amount: formatToDollar(item.currentBid),
      color: "text-green-600",
      biddername: item.bidderName || item.bidderEmail || "Unknown",
      bidderemail: item.bidderEmail || "No email",
      bidTime: item.bidTime,
    };
  };

  // Get unique auction types for filter options
  const auctionTypes = Array.from(
    new Set(items.map((item) => item.auctionType)),
  );

  return (
    <main className="container mx-auto">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-3xl font-bold">Manage Items</h1>
        <Link
          href="/items/create"
          className="bg-blue-800 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Crear nuevo Item
        </Link>
      </div>

      {/* Client Component for filtering */}
      <AuctionFilter
        auctionTypes={auctionTypes}
        totalItems={items.length}
        filteredCount={filteredItems.length}
      />

      <BulkDeleteManager
        totalItems={filteredItems.length}
        allItemIds={filteredItems.map((item) => item.id)}
      >
        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {selectedType
                ? `No ${selectedType} items found`
                : "No items found"}
            </p>
          </div>
        ) : (
          <>
            {/* Select All Header */}
            <SelectAllCheckbox itemCount={filteredItems.length} />

            <div className="grid gap-1">
              {filteredItems.map((item) => {
                const bidInfo = getBidStatusInfo(item);

                return (
                  <div
                    key={item.id}
                    className={`border rounded-lg py-1 px-2 flex items-center gap-4 ${
                      item.isFeatured ? "border-purple-400 bg-purple-50" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <ItemCheckbox itemId={item.id} />

                    <div className="w-20 h-20 relative flex-shrink-0">
                      {item.imageURL ? (
                        <Image
                          src={item.imageURL}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-cover rounded block"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        {getStatusBadge(
                          item.auctionType,
                          item.bidEndTime,
                          item.isFeatured,
                          item.status,
                        )}
                        <span className="text-xs mr-4">
                          Ends: {formatDate(item.bidEndTime)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">
                        Descripcion: {item.description}
                      </p>
                      <div className="text-sm text-gray-500">
                        <span className="mr-4">
                          Starting: ${item.startingPrice}
                        </span>
                        <span className="mr-4">
                          Interval: ${item.bidInterval}
                        </span>
                        <span className="font-medium">Precio actual: $ </span>
                        <span className={`mr-4 font-semibold ${bidInfo.color}`}>
                          {bidInfo.amount}
                        </span>
                        <span className="mr-4">{bidInfo.display}</span>
                        {bidInfo.bidderemail && (
                          <>
                            <span className="font-medium mr-4">
                              Ganador: {bidInfo.biddername}
                            </span>
                            <span>Contacto: {bidInfo.bidderemail}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex gap-2 items-center">
                      {/* Only show feature toggle for live auctions */}
                      {item.auctionType === "live" && (
                        <form action={ToggleFeaturedAction.bind(null, item.id)}>
                          <button
                            type="submit"
                            className={`px-3 py-2 rounded-lg text-sm font-medium ${
                              item.isFeatured
                                ? "bg-purple-800 hover:bg-purple-700 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            }`}
                          >
                            {item.isFeatured ? "Unfeatured" : "Feature"}
                          </button>
                        </form>
                      )}

                      <Link
                        href={`/items/edit/${item.id}`}
                        className="bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
                      >
                        Edit
                      </Link>

                      <DeleteItemButton itemId={item.id} itemName={item.name} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </BulkDeleteManager>
    </main>
  );
}
