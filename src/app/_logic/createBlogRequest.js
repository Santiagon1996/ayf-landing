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
    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog`, {
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
    } catch (errorr) {
      throw new SystemError(
        `Error al crear Blog (status ${response.status})`,
        error.message
      );
    }
    const { error, message } = body;
    const ErrorConstructor = errors[error];
    throw new ErrorConstructor(message);
  }
};
