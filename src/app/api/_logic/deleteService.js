import { Service } from "@/lib/db/models/index.js";
import { errors, validate } from "shared";
import mongoose from "mongoose";

const { NotFoundError, SystemError } = errors;

const { validateId } = validate;

export const deleteService = async (adminId, serviceId) => {
  // Validar el ID del administrador
  validateId(adminId);
  // Validar el ID del servicio
  validateId(serviceId);

  let deletedService;
  try {
    // Buscar y eliminar la servicio por ID
    deletedService = await Service.findByIdAndDelete(serviceId);

    // Si no se encuentra el servico, lanzar un error
    if (!deletedService) {
      throw new NotFoundError("Service not found");
    }
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error; // Re-lanzar errores esperados
    }
    if (error instanceof mongoose.Error.CastError) {
      throw new NotFoundError("Service not found");
    }
    throw new SystemError(`Error deleting Service: ${error.message}`);
  }
};
