import { auth } from "@/auth";
import { database } from "@/db/database";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const itemId = Number(searchParams.get("item"));

  if (!itemId) return NextResponse.json([]);

  const messages = await database.chatMessage.findMany({
    where: { itemId },
    include: { user: true },
    orderBy: { timestamp: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { message, itemId } = body;

  if (!message || !itemId) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  const newMessage = await database.chatMessage.create({
    data: {
      itemId: Number(itemId),
      userId: session.user.id,
      message,
    },
  });

  return NextResponse.json(newMessage);
}
