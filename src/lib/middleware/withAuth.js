import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // <-- Importación clave para leer cookies
import jwt from "jsonwebtoken";
import { errors } from "shared";

const { AuthorizationError, SystemError } = errors;

const { JWT_SECRET } = process.env;

/**
 * Función de Orden Superior (HOF) para proteger rutas de API en Next.js App Router.
 * - Verifica la autenticación (validez del accessToken de la cookie).
 * - Realiza la autorización (opcionalmente por rol).
 * - Pasa la información del usuario autenticado (id, role) al manejador de la ruta.
 *
 * @param {Function} handler - La función manejadora de la ruta (e.g., async function GET(req, { userId, userRole }) { ... }).
 * @param {string[]} [allowedRoles=[]] - Un array de roles permitidos. Si se proporciona, solo los usuarios con estos roles podrán acceder.
 * @returns {Function} Un nuevo manejador de ruta envuelto con la lógica de autenticación/autorización.
 */

export const withAuth = (handler) => {
  return async (req) => {
    try {
      // Obtener las cookies de la solicitud
      const accessToken = (await cookies()).get("accessToken")?.value;
      if (!accessToken) {
        throw new AuthorizationError("Access token is missing");
      }

      let decoded;

      try {
        // Verificar y decodificar el token JWT
        decoded = jwt.verify(accessToken, JWT_SECRET);
      } catch (error) {
        if (
          error instanceof jwt.JsonWebTokenError ||
          error instanceof jwt.TokenExpiredError
        ) {
          throw new AuthorizationError("Invalid or expired access token");
        }
        throw new SystemError(
          "Internal server error during token verification."
        );
      }

      // Extraer información del token decodificado
      const { id: userId, role: userRole } = decoded;

      // Verificar si el usuarioId y el rol están presentes
      if (!userId || !userRole) {
        throw new AuthorizationError(
          "Invalid token payload: userId or role is missing"
        );
      }

      // Llamar al manejador de la ruta con la información del usuario
      const response = await handler(req, { userId, userRole });
      // Retornar la respuesta del manejador

      return response;
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return NextResponse.json({ message: error.message }, { status: 401 }); // 401 Unauthorized o 403 Forbidden
      }
      // Para cualquier otro error inesperado dentro de withAuth
      console.error("Error inesperado en withAuth:", error);
      return NextResponse.json(
        { message: "Internal server error." },
        { status: 500 }
      );
    }
  };
};
