import { errors, validate } from "shared";

const { SystemError } = errors;
const { validateUserRegister } = validate;
export const registerUserRequest = (userData) => {
  const { name, email, password } = userData;

  validateUserRegister(userData);

  let response;
  let body;

  return (async () => {
    try {
      response = await fetch(`api/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
    } catch (error) {
      throw new SystemError("Error al registrar usuario", error.message);
    }

    if (response.status === 201) {
      return;
    }

    if (!response.ok) {
      try {
        body = await response.json();
      } catch (error) {
        throw new SystemError("Error al registrar usuario", error.message);
      }

      const { error, message } = body;
      const ErrorConstructor = errors[error];
      throw new ErrorConstructor(message);
    }
  })();
};
