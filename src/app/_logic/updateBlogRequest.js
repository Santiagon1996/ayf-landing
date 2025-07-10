import { validate, errors } from "shared";
import { validateAndFilterUpdates } from "@/lib/utils/validateAndFilterUpdates";

const { SystemError, ValidateError } = errors;
const { validateId, updateBlogSchema } = validate;

export const updateBlogRequest = async (blogId, updatesData) => {
  let validatedUpdatedBlog;
  let validatedBlogId;
  let body;
  let response;

  try {
    validatedBlogId = validateId(blogId);
  } catch (error) {
    console.error('"Detalles de la validación fallida:", error.details');
    if (error instanceof ValidateError) {
      throw new ValidateError("Validation failed for ", error.details);
    }
    throw new SystemError("Validation failed for user ID", error.message);
  }

  try {
    validatedUpdatedBlog = validateAndFilterUpdates(
      updatesData,
      updateBlogSchema
    );
  } catch (error) {
    console.error('"Detalles de la validación fallida:", error.details');
    if (error instanceof ValidateError) {
      throw new ValidateError("Validation failed for ", error.details);
    }
    throw new SystemError("Validation failed for user ID", error.message);
  }

  try {
    response = await fetch(`/api/blogs/${blogId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedUpdatedBlog),
    });
  } catch (error) {
    throw new SystemError("Error al editar el blog", error.message);
  }
  if (response.status === 204) {
    return { success: true, message: "Blog editado correctamente" };
  }

  if (!response.ok) {
    try {
      body = await response.json();
      console.error("Backend error response body:", body); // Log el body completo para depuración
    } catch (parseError) {
      // Si el backend envió un código de error pero la respuesta NO era JSON
      throw new SystemError(
        `Server responded with status ${response.status}, but response was not valid JSON.`,
        parseError.message
      );
    }

    const { error: errorType, message, details } = body; // Renombrar 'error' a 'errorType' para evitar conflicto

    // Intenta encontrar el constructor de error específico de 'shared'
    const SpecificErrorConstructor = errors[errorType];

    if (
      SpecificErrorConstructor &&
      typeof SpecificErrorConstructor === "function"
    ) {
      // Si el tipo de error es conocido (ej. "ValidateError", "NotFoundError", "SystemError")
      if (errorType === "ValidateError") {
        throw new SpecificErrorConstructor(message, details); // Pasa los detalles para ValidateError
      } else {
        throw new SpecificErrorConstructor(message); // Para otros errores, solo el mensaje
      }
    } else {
      // Si el backend devolvió un error, pero el 'errorType' es desconocido o falta
      throw new SystemError(
        message || `Unknown error occurred (status ${response.status}).`,
        body // Pasar el cuerpo completo puede ayudar en la depuración
      );
    }
  }
};
