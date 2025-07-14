import { errors, validate } from "shared";
import { handleApiError } from "@/lib/handlers/handleApiError";

const { SystemError, ValidateError } = errors;
const { validateService } = validate;

export const createServiceRequest = async (serviceData) => {
  let validatedServiceData;
  let response;
  let body;

  try {
    validatedServiceData = validateService(serviceData);
  } catch (error) {
    console.error("Detalles de la validación fallida:", error.details);
    if (error instanceof ValidateError) {
      throw new ValidateError(
        "Validation failed for service data",
        error.details
      );
    }
    throw new SystemError("Validation error", error.message);
  }

  try {
    response = await fetch(`/api/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validatedServiceData),
    });
  } catch (error) {
    throw new SystemError("Error al crear propiedad", error.message);
  }

  if (response.status === 201) {
    try {
      const createdService = await response.json(); // Ahora sí, parsea el JSON
      return {
        success: true,
        message: "Servicio creado correctamente",
        service: createdService,
      };
    } catch (error) {
      throw new SystemError(
        "Servicio creado, pero error al leer la respuesta JSON.",
        error.message
      );
    }
  }

  if (!response.ok) {
    await handleApiError(response);
  }
};
