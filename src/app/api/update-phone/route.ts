import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No estás autenticado" },
        { status: 401 },
      );
    }

    // Parse the request body
    const { phone } = await request.json();

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { error: "Número de teléfono requerido" },
        { status: 400 },
      );
    }

    // Update the user's phone number in the database
    const updatedUser = await database
      .update(users)
      .set({
        phone: phone.trim(),
      })
      .where(eq(users.email, session.user.email))
      .returning({ id: users.id, phone: users.phone });

    if (updatedUser.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Número de teléfono actualizado correctamente",
        phone: updatedUser[0].phone,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating phone number:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
