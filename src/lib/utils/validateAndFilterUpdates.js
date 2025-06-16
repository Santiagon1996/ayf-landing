import { errors } from "shared"; // Asumo que 'shared' contiene tus errores
import { z } from "zod"; // Asegúrate de importar Zod si no viene de 'shared' directamente

const { ValidateError } = errors;

/**
 * Valida y filtra un objeto de actualizaciones para asegurar que solo contenga campos válidos
 * y no campos con valores vacíos (undefined, null, string vacío).
 *
 * @param {object} updates - El objeto con los campos a actualizar.
 * @param {z.ZodSchema} validationSchema - El esquema Zod específico para validar estas actualizaciones.
 * @returns {object} Un objeto con los campos de actualización validados y filtrados.
 * @throws {ValidateError} Si los updates son inválidos o no contienen campos válidos.
 */
export const validateAndFilterUpdates = (updates, validationSchema) => {
  // 1. Validación inicial del tipo de entrada
  if (
    !updates ||
    typeof updates !== "object" ||
    Array.isArray(updates) ||
    Object.keys(updates).length === 0
  ) {
    throw new ValidateError("Updates must be a non-empty object.");
  }

  // 2. Validar los datos de entrada usando el esquema Zod proporcionado
  const validationResult = validationSchema.safeParse(updates);

  if (!validationResult.success) {
    const detailedErrors = validationResult.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    throw new ValidateError(
      "Validation failed for updates.", // Mensaje más genérico
      detailedErrors
    );
  }

  // 3. Filtrar campos con valores "vacíos" (undefined, null, "")
  const filteredUpdates = Object.entries(validationResult.data).reduce(
    (acc, [key, value]) => {
      // Solo incluimos el campo si su valor no es undefined, null o una cadena vacía.
      // Esto permite que 'false' o '0' pasen si son valores intencionados.
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = value;
      }
      return acc;
    },
    {}
  );

  // 4. Verificar si quedaron campos válidos después del filtro
  if (!Object.keys(filteredUpdates).length) {
    throw new ValidateError(
      "No valid fields provided for update or all provided fields were empty/null/invalid after Zod validation."
    );
  }

  return filteredUpdates;
};
