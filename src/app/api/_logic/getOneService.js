import { Service } from "@/lib/db/models/index.js";
import { errors, validate } from "shared";

const { SystemError, NotFoundError, ValidateError } = errors;
const { validateId } = validate;

export const getOneService = async (serviceId) => {
  let validateServiceId;
  try {
    validateServiceId = validateId(serviceId);
  } catch (error) {
    console.error("Detalles de la validación fallida:", error.details);
    if (error instanceof ValidateError) {
      throw new ValidateError("Validation failed for ", error.details);
    }
    throw new SystemError("Validation failed for service ID", error.message);
  }

  try {
    const service = await Service.findById(validateServiceId).lean();

    if (!service) {
      throw new NotFoundError(`Service with id ${validateServiceId} not found`);
    }

    return service;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error; // Re-lanzar errores conocidos
    }
    throw new SystemError(error.message); // Transformar errores inesperados
  }
};
