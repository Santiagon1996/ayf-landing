import { validate, errors } from "shared";
import { validateAndFilterUpdates } from "@/lib/utils/validateAndFilterUpdates";
import { handleApiError } from "@/lib/handlers/handleApiError";

const { SystemError, ValidateError } = errors;
const { validateId, updateServiceSchema } = validate;

export const updateServiceRequest = async (updatesData, serviceId) => {
  let validatedUpdatedService;
  let validateServiceId;
  let body;
  let response;

  try {
    validateServiceId = validateId(serviceId);
  } catch (error) {
    console.error("Detalles de la validación fallida:", error.details);
    if (error instanceof ValidateError) {
      throw new ValidateError("Validation failed for ", error.details);
    }
    throw new SystemError("Validation failed for user ID", error.message);
  }

  try {
    validatedUpdatedService = validateAndFilterUpdates(
      updatesData,
      updateServiceSchema
    );
  } catch (error) {
    console.error('"Detalles de la validación fallida:", error.details');
    if (error instanceof ValidateError) {
      throw new ValidateError("Validation failed for ", error.details);
    }
    throw new SystemError("Validation failed for user ID", error.message);
  }

  try {
    response = await fetch(`/api/services/${validateServiceId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedUpdatedService),
    });
  } catch (error) {
    throw new SystemError("Error al editar el servicio", error.message);
  }
  if (response.status === 204) {
    return { success: true, message: "Servicio editado correctamente" };
  }

  if (!response.ok) {
    await handleApiError(response);
  }
};
