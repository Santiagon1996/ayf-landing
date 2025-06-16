import { User } from "../db/models/index.js";
import { errors, validate } from "shared";
const { AuthorizationError, SystemError } = errors;
const { validateId } = validate;

export const ensureAdminAuth = async (adminId) => {
  validateId(adminId); // Valida el formato del ID

  try {
    const user = await User.findById(adminId);
    // Verifica si el usuario existe Y si tiene el rol de administrador
    if (!user || user.role !== "admin") {
      // O solo !user si tu AuthorizationError ya implica rol
      throw new AuthorizationError(
        "Unauthorized: Invalid or insufficient permissions."
      );
    }
    return user; // Opcional: devuelve el usuario si lo necesitas más tarde
  } catch (error) {
    // Si ya es un AuthorizationError, relánzalo directamente
    if (error instanceof AuthorizationError) {
      throw error;
    }
    // Para cualquier otro error (ej. problema de conexión a DB)
    throw new SystemError(
      "Error verifying administrator authentication",
      error.message
    );
  }
};
