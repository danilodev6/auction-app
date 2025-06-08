// app/api/bids/route.ts
import { getBids } from "@/data-access/bids";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const itemId = Number(searchParams.get("itemId"));
  if (!itemId) return new Response("Missing itemId", { status: 400 });

  const bids = await getBids(itemId);
  return Response.json(bids);
}
