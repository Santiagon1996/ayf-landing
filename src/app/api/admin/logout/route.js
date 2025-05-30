// app/api/auth/logout/route.js
import { NextResponse } from "next/server";
import { withErrorHandler } from "../../../../lib/handlers/index.js";
import { logoutUser } from "../../_logic/logoutUser.js";

export async function POST(req) {
  return await withErrorHandler(async (request) => {
    // Llama a tu lógica de logout separada
    await logoutUser(); // Ahora usamos await porque logoutUser es async

    // Devuelve una respuesta de éxito al cliente
    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
  })(req);
}
