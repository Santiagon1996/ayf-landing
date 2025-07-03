// lib/utils/isUserLoggedIn.js
import { errors } from "shared"; // Importa tu módulo de errores

const { AuthorizationError, SystemError } = errors; // Mantenerlos para posible uso futuro o para otros casos

/**
 * Verifica si el usuario está logueado consultando un endpoint de API.
 * Este endpoint (`/api/auth/status`), a su vez, verificará el token en la cookie (lado del servidor).
 *
 * @returns {Promise<boolean>} True si el usuario está logueado y el token es válido, false en caso contrario.
 * @throws {SystemError} Si hay un error de red o un problema inesperado en el servidor (no relacionado con autenticación).
 */
export const isUserLoggedIn = async () => {
  // Solo se ejecuta en el navegador (client-side)
  if (typeof window === "undefined") {
    return false; // No hay navegador, no hay sesión de cliente que verificar.
  }

  let response;

  try {
    // Realiza la petición al endpoint de estado de autenticación
    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Next.js automáticamente enviará las cookies de sesión con la petición
      // si la URL es del mismo origen.
    });
  } catch (error) {
    // Captura errores de red (ej. servidor no alcanzable, DNS fallido).
    // Estos SÍ son errores del sistema, no un estado de "no logueado".
    throw new SystemError(
      "Error de red al verificar estado de login",
      error.message
    );
  }

  // Si la respuesta es exitosa (código 2xx), el usuario está logueado.
  if (response.ok) {
    const data = await response.json();
    return data.loggedIn; // Debería ser `true` si la API devolvió 200 OK y `loggedIn: true`
  }

  // Si la respuesta no es 2xx, manejamos los diferentes casos.
  // IMPORTANTE: Si la API devuelve 401 o 403, esto significa "no autenticado/autorizado".
  // Para isUserLoggedIn, esto se traduce directamente en 'false'.
  if (response.status === 401 || response.status === 403) {
    // El usuario no está logueado o su token es inválido/expirado.
    // Esto es un estado esperado, no un error del sistema para esta función.
    return false;
  }

  // Para cualquier otro código de estado HTTP (ej. 5xx Server Error)
  // o si la respuesta no es JSON válido (lo cual indicaría un problema en el backend)
  let body;
  try {
    body = await response.json();
  } catch (error) {
    // Si la respuesta no es OK y tampoco es JSON válido (ej. HTML de error del servidor),
    // es un error del sistema.
    throw new SystemError(
      `Error de formato de respuesta de la API de estado de login: ${response.status}`,
      error.message
    );
  }

  // Si el backend envió un error con un tipo de error y mensaje (pero no fue 401/403)
  // Todavía podría ser un SystemError si es un error 5xx, o un error inesperado.
  const { error: apiErrorType, message } = body;
  // Consideramos cualquier otra respuesta no-OK/no-401/403 como un error del sistema.
  throw new SystemError(
    `Error inesperado del servidor (${response.status} - ${
      apiErrorType || "unknown"
    }): ${message || "No message provided."}`
  );
};
