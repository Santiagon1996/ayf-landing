import { errors, validate } from "shared";

const { SystemError, ValidateError } = errors;
const { validateBlog, validateId } = validate;

export const createBlogRequest = async (blogData) => {
  let validatedBlogData;
  let response;
  let body;

  try {
    validatedBlogData = validateBlog(blogData);
  } catch (error) {
    console.error("Detalles de la validación fallida:", error.details);
    if (error instanceof ValidateError) {
      throw new ValidateError(
        "Validation failed for blog post data",
        error.details
      );
    }
    throw new SystemError("Validation error", error.message);
  }

  try {
    response = await fetch(`/api/blogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validatedBlogData),
    });
  } catch (error) {
    throw new SystemError("Error al crear Blog", error.message);
  }

  if (response.status === 201) {
    return { success: true, message: "Blog creado correctamente " };
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
