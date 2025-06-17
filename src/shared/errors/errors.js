class BaseError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.details = details; // Detalles adicionales (puede ser un objeto o array)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      details: this.details,
    };
  }
}

class DuplicityError extends BaseError {}
class CredentialsError extends BaseError {}
class NotFoundError extends BaseError {}
class OwnershipError extends BaseError {}
class SystemError extends BaseError {}
class ValidateError extends BaseError {}
class AuthorizationError extends BaseError {}

export {
  DuplicityError,
  CredentialsError,
  NotFoundError,
  OwnershipError,
  SystemError,
  ValidateError,
  AuthorizationError,
};

const errors = {
  DuplicityError,
  CredentialsError,
  NotFoundError,
  OwnershipError,
  SystemError,
  ValidateError,
  AuthorizationError,
};

export default errors;
