import { errors } from "shared";

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
  const url = type
    ? `${process.env.NEXT_PUBLIC_API_URL}/services?type=${type}`
    : `${process.env.NEXT_PUBLIC_API_URL}/services`;

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
    try {
      body = await response.json();
    } catch (error) {
      throw new SystemError(
        "Error al procesar la respuesta de los servicios",
        error.message
      );
    }

    const { error: errorType, message } = body; // Se renombra 'error' a 'errorType' para evitar conflictos
    const ErrorConstructor = errors[errorType];

    // Asegúrate de que el ErrorConstructor exista y sea una función antes de lanzarlo
    if (ErrorConstructor && typeof ErrorConstructor === "function") {
      throw new ErrorConstructor(message);
    } else {
      // Fallback para tipos de error desconocidos o faltantes desde el backend
      throw new SystemError(
        message || `Ocurrió un error desconocido (estado ${response.status}).`,
        body // Pasa el cuerpo completo para depuración si es necesario
      );
    }
  }
};
