// app/_logic/logoutUserRequest.js
import { errors } from "shared";

const { SystemError } = errors;

/**
 * Llama al endpoint de logout para borrar la cookie de sesión en el servidor.
 * @returns {Promise<void>} Se resuelve si el logout fue exitoso.
 * @throws {SystemError} Si ocurre un error de red o el servidor responde con error.
 */
export const logoutUserRequest = async () => {
  let response;

  try {
    response = await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include", // Importante para que envíe la cookie y el servidor pueda borrarla
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (networkError) {
    throw new SystemError(
      "Error de red al cerrar sesión",
      networkError.message
    );
  }

  if (response.ok) {
    // Logout exitoso, no hay body que procesar
    return;
  }

  // Si no fue OK, intentar parsear mensaje de error
  let errorBody;
  try {
    errorBody = await response.json();
    throw new SystemError(
      errorBody.message || "Error al cerrar sesión en el servidor"
    );
  } catch (parseError) {
    // Si ni siquiera podemos parsear JSON, lanzamos un SystemError genérico
    throw new SystemError("Error al cerrar sesión", parseError.message);
  }
};
