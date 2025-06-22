import { NextResponse } from "next/server";
import { auth, needsPhoneNumber } from "@/auth";

export async function GET() {
  try {
    // Get the current session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { needsPhone: false, authenticated: false },
        { status: 200 },
      );
    }

    // Check if user needs to provide phone number
    const needsPhone = await needsPhoneNumber(session.user.email);

    return NextResponse.json(
      {
        needsPhone,
        authenticated: true,
        email: session.user.email,
      },
      { status: 200 },
    );
  } catch {
    console.error("Error checking phone status:", Error);
    return NextResponse.json(
      { error: "Error interno del servidor", needsPhone: false },
      { status: 500 },
    );
  }
  }
