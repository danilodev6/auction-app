import { pusherServer } from "@/lib/pusher-server";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, itemId } = await req.json();

  // Fix: Use pusherServer instead of pusher
  await pusherServer.trigger(`chat-${itemId}`, "new-message", {
    user: session.user.name,
    message,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
