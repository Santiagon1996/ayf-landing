import { User } from "../../../lib/db/models/index.js";
import { errors, validate } from "shared";

const { AuthorizationError, SystemError } = errors;

const { validateUserId } = validate;

export const getUserById = async (userId) => {
  if (!userId) {
    throw new AuthorizationError("User ID is required to fetch user data.");
  }

  // Validar el ID del usuario
  validateUserId(userId);

  let user;
  try {
    // Importante: No selecciones la contraseña ni otros datos sensibles aquí
    user = await User.findById(userId);
  } catch (error) {
    throw new SystemError(
      "Error fetching user data from database by ID.",
      error.message
    );
  }

  if (!user) {
    // Si el usuario no se encuentra (ej. fue eliminado después de emitir el token)
    throw new AuthorizationError(
      "Authenticated user not found in the database."
    );
  }

  // Asegúrate de devolver solo los datos seguros
  const { password, ...userSafeData } = user.toObject ? user.toObject() : user;
  return userSafeData;
};
