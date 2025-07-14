import { errors } from "shared";

const {
  ValidateError,
  DuplicityError,
  AuthorizationError,
  NotFoundError,
  OwnershipError,
  SystemError,
} = errors;
export const handleApiError = async (response) => {
  let body;

  try {
    body = await response.json();
  } catch (e) {
    throw new SystemError("Respuesta del servidor inválida", e.message);
  }

  const { error, message, details } = body;

  switch (error) {
    case "ValidateError":
      throw new ValidateError(message, details);
    case "DuplicityError":
      throw new DuplicityError(message, details);
    case "AuthorizationError":
      throw new AuthorizationError(message, details);
    case "NotFoundError":
      throw new NotFoundError(message, details);
    case "OwnershipError":
      throw new OwnershipError(message, details);
    default:
      throw new SystemError(message || "Error desconocido", details);
  }
};
