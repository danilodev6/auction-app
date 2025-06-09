import { redirect } from "next/navigation";
import { auth, isAdmin } from "@/auth";
import Link from "next/link";
import Image from "next/image";
import { GetAllItemsAction, ToggleFeaturedAction } from "./actions";
import DeleteItemButton from "./DeleteItemButton";

export default async function ManageItemsPage() {
  const session = await auth();

  if (!session || !(await isAdmin(session))) {
    redirect("/");
  }

  const items = await GetAllItemsAction();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusBadge = (
    auctionType: string,
    endTime: Date,
    isFeatured: boolean,
  ) => {
    const now = new Date();
    const isExpired = now > new Date(endTime);

    let statusText = auctionType;
    let statusColor = "bg-gray-500";

    if (auctionType === "draft") {
      statusColor = "bg-yellow-500";
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
    }

    return (
      <span className={`px-2 py-1 rounded text-white text-xs ${statusColor}`}>
        {statusText}
      </span>
    );
  };

  return (
    <main className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Items</h1>
        <Link
          href="/items/create"
          className="bg-blue-800 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Create New Item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No items found</p>
          <Link
            href="/items/create"
            className="bg-blue-800 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Create Your First Item
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 flex items-center gap-4"
            >
              <div className="w-20 h-20 relative flex-shrink-0">
                {item.imageURL ? (
                  <Image
                    src={item.imageURL}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
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
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {item.description}
                </p>
                <div className="text-sm text-gray-500">
                  <span className="mr-4">Starting: ${item.startingPrice}</span>
                  <span className="mr-4">Interval: ${item.bidInterval}</span>
                  <span>Ends: {formatDate(item.bidEndTime)}</span>
                </div>
              </div>

              <div className="flex-shrink-0 flex gap-2">
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
          ))}
        </div>
      )}
    </main>
  );
}
