import { errors, validate } from "shared";

const { SystemError, ValidateError } = errors;
const { validateId } = validate;

export const getBlogByIdRequest = async (blogId) => {
  let validateBlogId;
  let body;
  let response;

  try {
    validateBlogId = validateId(blogId);
  } catch (error) {
    console.error("Detalles de la validación fallida:", error.details);
    if (error instanceof ValidateError) {
      throw new ValidateError("Validation failed for ", error.details);
    }
    throw new SystemError("Validation failed for blog ID", error.message);
  }
  try {
    response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    throw new SystemError("Error al obtener el blog", error.message);
  }

  if (response.status === 200) {
    try {
      body = await response.json();
      return body;
    } catch (error) {
      throw new SystemError(
        "Error al parsear la respuesta JSON del blog    ",
        error.message
      );
    }
  }

  if (!response.ok) {
    try {
      body = await response.json();
    } catch (error) {
      throw new SystemError(
        "Error al procesar la respuesta de los blogs",
        error.message
      );
    }

    const { error, message } = body;
    const ErrorConstructor = errors[error];
    throw new ErrorConstructor(message);
  }
};
