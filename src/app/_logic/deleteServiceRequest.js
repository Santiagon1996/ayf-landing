import { validate, errors } from "shared";
import { handleApiError } from "@/lib/handlers/handleApiError";

const { SystemError, ValidateError } = errors;
const { validateId } = validate;

export const deleteServiceRequest = async (serviceId) => {
  let response;
  let body;
  let validatedServiceId;

  try {
    validatedServiceId = validateId(serviceId);
  } catch (error) {
    console.error('"Detalles de la validación fallida:", error.details');
    if (error instanceof ValidateError) {
      throw new ValidateError("Validation failed for ", error.details);
    }
    throw new SystemError("Validation failed for user ID", error.message);
  }

  try {
    response = await fetch(`/api/services/${validatedServiceId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    throw new SystemError("Error al eliminar el servicio", error.message);
  }

  if (response.status === 204) {
    return { success: true, message: "Servicio eliminado correctamente" };
  }

  if (!response.ok) {
    await handleApiError(response);
  }
};
