import { errors, validate } from "shared";

const { SystemError } = errors;
const { validateUserLogin } = validate;
export const loginUserRequest = (userData) => {
  const { name, password } = userData;

  validateUserLogin(userData);

  let response;
  let body;

  return (async () => {
    try {
      response = await fetch(`api/admin/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, password }),
      });
    } catch (error) {
      throw new SystemError("Error al iniciar sesión", error.message);
    }

    if (response.status === 200) {
      body = await response.json();

      return body;
    }
    if (!response.ok) {
      try {
        body = await response.json();
      } catch (error) {
        throw new SystemError("Error al iniciar sesión", error.message);
      }

      const { error, message } = body;
      const ErrorConstructor = errors[error];
      throw new ErrorConstructor(message);
    }
  })();
};
