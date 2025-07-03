// import { pusherClient } from "@/lib/pusher-client";
// import { auth } from "@/auth";
// import { NextRequest, NextResponse } from "next/server";
//
// export async function POST(req: NextRequest) {
//   const session = await auth();
//
//   if (!session?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }
//
//   const { message, itemId } = await req.json();
//
//   await pusherClient.trigger(`chat-${itemId}`, "new-message", {
//     user: session.user.name,
//     message,
//     timestamp: new Date().toISOString(),
//   });
//
//   return NextResponse.json({ success: true });
// }

// /api/pusher.ts
import { NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  const body = await req.json();

  const { channel, event, data } = body;

  await pusher.trigger(channel, event, data);

  return NextResponse.json({ success: true });
}
