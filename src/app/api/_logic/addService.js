import { Service } from "../../../lib/db/models/index.js";
import { ensureAdminAuth } from "@/lib/utils/ensureAdminAuth.js";
import { errors, validate } from "shared";

const { DuplicityError, SystemError, ValidateError } = errors;
const { validateService } = validate;

export const addService = async (serviceData, adminId) => {
  let validatedAndParsedServiceData;

  try {
    validatedAndParsedServiceData = validateService(serviceData);
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
    await ensureAdminAuth(adminId);
  } catch (error) {
    throw error;
  }

  let newService;

  try {
    console.log(
      "Datos que se envían a Service.create:",
      validatedAndParsedServiceData
    );

    newService = await Service.create(validatedAndParsedServiceData);

    console.log(
      "Service created, Mongoose returned:",
      newService ? newService.toObject() : newService
    );
    return newService;
  } catch (error) {
    if (error.code === 11000) {
      throw new DuplicityError("Service already exists with this name.");
    }
    if (error.name === "ValidationError") {
      const details = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));
      console.error(
        "Mongoose Validation Failed Details (addService):",
        details
      );

      throw new ValidateError(
        "Mongoose validation failed for service data",
        details
      );
    }
    // Otros errores inesperados de la DB
    console.error("Error creating service:", error);
    throw new SystemError("Error creating service", error.message);
  }
};
