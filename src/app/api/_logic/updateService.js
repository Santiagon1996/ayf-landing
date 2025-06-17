import { Service } from "@/lib/db/models/index.js";
import { errors, validate } from "shared";
import { validateAndFilterUpdates } from "@/lib/utils/validateAndFilterUpdates";
import { ensureAdminAuth } from "@/lib/utils/ensureAdminAuth.js";
import { updateServiceSchema } from "@/shared/validates/validate.js";
const { SystemError, ValidateError, NotFoundError } = errors;

const { validateId } = validate;

export const updateService = async (updatesData, adminId, serviceId) => {
  // Validate admin ID
  validateId(adminId);
  // Validate service ID
  validateId(serviceId);

  let updates;
  try {
    updates = validateAndFilterUpdates(updatesData, updateServiceSchema);
  } catch (error) {
    console.error("Detalles de la validación fallida:", error.details);
    if (error instanceof ValidateError) {
      throw new ValidateError(
        "Validation failed for service updates",
        error.details
      );
    }
    throw new SystemError("Unexpected error during validation", error.message);
  }

  try {
    await ensureAdminAuth(adminId);
  } catch (error) {
    throw error;
  }

  let updatedService;

  try {
    updatedService = await Service.findByIdAndUpdate(serviceId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedService) {
      throw new NotFoundError("Service not found");
    }

    return updatedService;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error; // Re-lanzar errores esperados
    }
    throw new SystemError("Error updating service", error.message);
  }
};
