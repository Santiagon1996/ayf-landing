import { Service } from "@/lib/db/models/index.js";
import { errors } from "shared";

const { SystemError, NotFoundError } = errors;

export const getServices = async () => {
  let service;
  try {
    service = await Service.find()
      .select("-__v")
      .sort("title") // Ordena alfabéticamente por título
      .lean();

    console.log("Servicios encontrados:", service.length);

    service.forEach((service) => {
      service.id = service._id.toString();
      delete service._id;
    });

    if (service.length === 0) {
      throw new NotFoundError("No service found");
    }
    return service;
  } catch (error) {
    // Manejo de errores
    if (error instanceof NotFoundError) {
      throw error; // Lanza el error original
    }
    throw new SystemError(`Error fetching service: ${error.message}`);
  }
};
