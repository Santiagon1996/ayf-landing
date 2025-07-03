import { Service } from "@/lib/db/models/index.js";
import { errors } from "shared";

const { SystemError, NotFoundError } = errors;

/**
 * Obtiene servicios, opcionalmente filtrados por categoría.
 * @param {string} [category] - La categoría por la que filtrar los servicios (ej. 'juridico', 'contable').
 * @returns {Promise<Array>} Una promesa que resuelve con la lista de servicios.
 * @throws {NotFoundError} Si no se encuentran servicios para la categoría especificada o en general.
 * @throws {SystemError} Si ocurre un error al obtener los servicios.
 */
export const getServices = async (type) => {
  let services;
  let query = {}; // Objeto para construir la consulta de Mongoose

  if (type) {
    // Si se proporciona una categoría, la añadimos al objeto de consulta
    query.type = type.toLowerCase();
  }

  try {
    services = await Service.find(query).select("-__v").sort("title").lean();

    console.log(
      `Servicios encontrados (categoría: ${type || "todos"}):`,
      services.length
    );

    services.forEach((service) => {
      service.id = service._id.toString();
      delete service._id;
    });

    if (services.length === 0) {
      // Puedes ser más específico aquí si lo deseas:
      // throw new NotFoundError(category ? `No services found for category: ${category}` : "No services found");
      throw new NotFoundError("No services found");
    }
    return services;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new SystemError(`Error fetching services: ${error.message}`);
  }
};
