// import { pusherServer } from "@/lib/pusher-server";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.name) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { message, itemId } = await req.json();

  await pusher.trigger(`chat-${itemId}`, "new-message", {
    user: session.user.name,
    message,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ status: "sent" });
}
