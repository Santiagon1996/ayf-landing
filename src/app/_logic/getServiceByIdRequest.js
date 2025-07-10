import { errors, validate } from "shared";

const { SystemError, ValidateError } = errors;
const { validateId } = validate;

export const getServiceByIdRequest = async (serviceId) => {
  let validatedServiceId;
  let body;
  let response;

  try {
    validatedServiceId = validateId(serviceId);
  } catch (error) {
    console.error("Detalles de la validación fallida:", error.details);
    if (error instanceof ValidateError) {
      throw new ValidateError("Validation failed for ", error.details);
    }
    throw new SystemError("Validation failed for service ID", error.message);
  }
  try {
    response = await fetch(`api/services/${validatedServiceId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    throw new SystemError("Error al obtener el servicio", error.message);
  }

  if (response.status === 200) {
    try {
      body = await response.json();
      return body;
    } catch (error) {
      throw new SystemError(
        "Error al parsear la respuesta JSON del servicio    ",
        error.message
      );
    }
  }

  if (!response.ok) {
    try {
      body = await response.json();
    } catch (error) {
      throw new SystemError(
        "Error al procesar la respuesta de los servicios",
        error.message
      );
    }

    const { error, message } = body;
    const ErrorConstructor = errors[error];
    throw new ErrorConstructor(message);
  }
};
