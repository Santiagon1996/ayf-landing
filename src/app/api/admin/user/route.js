// app/api/auth/me/route.js
import { NextResponse } from "next/server";
// No necesitamos 'cookies' aquí, 'withAuth' se encarga de eso
import { withErrorHandler } from "../../../../lib/handlers/index.js";
import { withAuth } from "../../../../lib/middleware/withAuth.js"; // <-- La ruta a tu middleware
import { getUserById } from "../../_logic/getUserById.js"; // <-- Tu función getUserById

async function getMeRouteHandler(req, { userId, userRole }) {
  console.log("DEBUG: getMeRouteHandler - userId recibido:", userId);
  console.log("DEBUG: getMeRouteHandler - userRole recibido:", userRole);

  if (!userId) {
    console.error("ERROR: userId es undefined en getMeRouteHandler.");
    throw new Error("User ID is missing after authentication."); // Lanzar un error claro
  }

  try {
    const user = await getUserById(userId);
    console.log(
      "DEBUG: Usuario obtenido de la DB:",
      user ? user.email : "Usuario no encontrado"
    );
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error(
      "ERROR: Fallo al obtener usuario por ID en getMeRouteHandler:",
      error
    );
    // Relanzar el error o lanzar uno nuevo para que withErrorHandler lo capture
    throw error;
  }
}

export const GET = withErrorHandler(withAuth(getMeRouteHandler));
