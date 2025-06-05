import { User } from "../../../lib/db/models/index.js";
import { errors, validate } from "shared";

const { DuplicityError, SystemError } = errors;
const { validateUserRegister } = validate;

export const registerUser = async (userData) => {
  const { name, email, password } = userData;

  validateUserRegister(userData);

  let user;

  try {
    user = await User.findOne({ email });
  } catch (error) {
    throw new SystemError("Error checking user existence", error.message);
  }

  if (user) {
    throw new DuplicityError("User already exists with this email");
  }

  try {
    const newUser = await User.create({ name, email, password });
    return newUser;
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    throw new SystemError("Error creating user", error.message);
  }
};
