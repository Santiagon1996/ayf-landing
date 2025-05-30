import { User } from "../../../lib/db/models/index.js";
import { errors, validate } from "shared";
import bcrypt from "bcryptjs";

const { NotFoundError, SystemError, CredentialsError } = errors;

const { validateUserLogin } = validate;

export const authenticateUser = (userData) => {
  const { email, password } = userData;

  validateUserLogin(userData);

  return (async () => {
    let user;

    try {
      user = await User.findOne({ email }).select("+password");
    } catch (error) {
      throw new SystemError("Error checking user existence", error);
    }

    if (!user) {
      throw new NotFoundError("User not found with this email");
    }

    let match;

    try {
      match = await bcrypt.compare(password, user.password);
    } catch (error) {
      throw new SystemError("Error comparing passwords", error.message);
    }
    if (!match) {
      throw new CredentialsError("Invalid email or password");
    }

    return { id: user._id.toString(), role: user.role, name: user.name };
  })();
};
