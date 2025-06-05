import { User } from "../../../lib/db/models/index.js";
import { errors, validate } from "shared";
import bcrypt from "bcryptjs";

const { NotFoundError, SystemError, CredentialsError, ValidateError } = errors;

const { validateUserLogin } = validate;

export const authenticateUser = async (userData) => {
  const { name, password } = userData;

  try {
    validateUserLogin(userData);
  } catch (error) {
    if (error instanceof ValidateError) {
      throw new ValidateError(
        "Validation failed for user login",
        error.details
      );
    }
    throw new SystemError("Validation error", error.message);
  }

  let user;

  try {
    user = await User.findOne({ name }).select("+password"); //--> incorporo el select por que en el modelo de usuario la contraseña no se devuelve por defecto
  } catch (error) {
    throw new SystemError("Error checking user existence", error);
  }

  if (!user) {
    throw new NotFoundError("User not found with this name");
  }

  let match;

  try {
    match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new CredentialsError("Invalid email or password");
    }
  } catch (error) {
    if (error instanceof CredentialsError) throw error;
    throw new SystemError("Error comparing passwords", error.message);
  }

  return { id: user._id.toString(), role: user.role, name: user.name };
};
