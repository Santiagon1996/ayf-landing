import { errors } from "shared";
import jwt from "jsonwebtoken";

const {
  CredentialsError,
  DuplicityError,
  NotFoundError,
  OwnershipError,
  SystemError,
  ValidateError,
  AuthorizationError,
} = errors;
const { JsonWebTokenError, TokenExpiredError } = jwt;

export const errorHandler = (error, req, res) => {
  console.error(error); // Logueo del error

  let status = 500;
  let errorName = SystemError.name;
  let { message } = error;

  // Manejamos los diferentes tipos de errores según el tipo
  if (error instanceof DuplicityError) {
    status = 409;
    errorName = error.constructor.name;
  } else if (error instanceof ValidateError) {
    status = 400;
    errorName = error.constructor.name;
  } else if (error instanceof CredentialsError) {
    status = 401;
    errorName = error.constructor.name;
  } else if (error instanceof NotFoundError) {
    status = 404;
    errorName = error.constructor.name;
  } else if (error instanceof OwnershipError) {
    status = 403;
    errorName = error.constructor.name;
  } else if (error instanceof TokenExpiredError) {
    status = 401;
    errorName = AuthorizationError.name;
    message = "expired JWT";
  } else if (error instanceof JsonWebTokenError) {
    status = 401;
    errorName = AuthorizationError.name;
    message = "invalid JWT";
  }

  //Enviamos la respuesta con el error adecuado
  return res.json({ error: errorName, message }, { status });
};
