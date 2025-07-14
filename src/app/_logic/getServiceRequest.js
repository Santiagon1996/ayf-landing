import { errors } from "shared";
import { handleApiError } from "@/lib/handlers/handleApiError";

const { SystemError } = errors;

/**
 * Obtiene servicios de la API, opcionalmente filtrados por categoría (ámbito).
 * @param {string} [type] - La categoría/ámbito por la cual filtrar los servicios (ej. 'juridico', 'contable').
 * @returns {Promise<Array>} Una promesa que se resuelve con la lista de servicios.
 * @throws {SystemError} Si ocurre un error durante la operación de fetch o el parseo de la respuesta.
 */
export const getServiceRequest = async (type) => {
  // <--- Ahora acepta 'type'
  let response;
  let body;

  // Construye la URL dinámicamente basándose en el parámetro 'type'
  const url = type ? `/api/services?type=${type}` : `/api/services`;

  try {
    response = await fetch(url, {
      // <--- Usa la URL construida dinámicamente
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    throw new SystemError("Error al obtener los servicios", error.message);
  }

  if (response.status === 200) {
    try {
      body = await response.json();
      return body;
    } catch (error) {
      throw new SystemError(
        "Error al parsear la respuesta JSON de los servicios",
        error.message
      );
    }
  }

  if (!response.ok) {
    await handleApiError(response);
  }
};
