// app/api/auth/status/route.js
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/withAuth.js";
import { withErrorHandler } from "@/lib/handlers/withErrorHandler.js";

/**
 * GET handler para verificar el estado de la autenticación.
 * Esta ruta está protegida por withAuth. Si withAuth permite el acceso,
 * significa que el usuario está autenticado y tiene un token válido.
 *
 * @param {Request} req - El objeto de solicitud de Next.js.
 * @param {object} context - Contiene la información del usuario pasada por withAuth.
 * @param {string} context.userId - El ID del usuario autenticado.
 * @param {string} context.userRole - El rol del usuario autenticado.
 * @returns {NextResponse} Una respuesta JSON indicando el estado de la sesión.
 */
export const GET = withErrorHandler(
  withAuth(async (req, { userId, userRole }) => {
    // Si llegamos a este punto, withAuth ha validado la cookie y el token.
    // Esto significa que el usuario está logueado.
    return NextResponse.json(
      { loggedIn: true, userId: userId, userRole: userRole },
      { status: 200 }
    );
    // Si withAuth hubiera fallado (ej. token ausente/inválido),
    // habría devuelto un 401/403 antes de llegar aquí.
  })
);
