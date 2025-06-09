import { auth } from "@/auth";
import { database } from "@/db/database";
import { chatMessage, users } from "@/db/schema"; // Import your schema
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const itemId = Number(searchParams.get("item"));

  if (!itemId) return NextResponse.json([]);

  // Drizzle syntax with join
  const messages = await database
    .select({
      id: chatMessage.id,
      message: chatMessage.message,
      timestamp: chatMessage.timestamp,
      itemId: chatMessage.itemId,
      userId: chatMessage.userId,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(chatMessage)
    .leftJoin(users, eq(chatMessage.userId, users.id))
    .where(eq(chatMessage.itemId, itemId))
    .orderBy(asc(chatMessage.timestamp));

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

  // Drizzle insert syntax
  const newMessage = await database
    .insert(chatMessage)
    .values({
      itemId: Number(itemId),
      userId: session.user.id,
      message,
      timestamp: new Date(),
    })
    .returning();

  return NextResponse.json(newMessage[0]);
}
