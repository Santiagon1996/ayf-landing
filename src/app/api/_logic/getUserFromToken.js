import jwt from "jsonwebtoken";
import { User } from "../../../lib/db/models/index.js";
import { errors } from "shared";

const { AuthorizationError, SystemError } = errors;

export async function getUserFromToken(accessToken) {
  if (!accessToken) {
    throw new AuthorizationError(
      "No authentication token found. Please log in."
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      throw new AuthorizationError("Invalid or expired authentication token.");
    }
    throw new SystemError(
      "Error verifying authentication token.",
      error.message
    );
  }

  const userId = decoded.id;

  let user;
  try {
    user = await User.findById(userId);
  } catch (error) {
    throw new SystemError(
      "Error fetching user data from database.",
      error.message
    );
  }

  if (!user) {
    throw new AuthorizationError(
      "Authenticated user not found in the database."
    );
  }

  const { password, ...userSafeData } = user.toObject ? user.toObject() : user;
  return userSafeData;
}
