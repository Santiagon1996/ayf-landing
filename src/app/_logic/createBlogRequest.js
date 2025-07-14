import { errors, validate } from "shared";
import { handleApiError } from "@/lib/handlers/handleApiError";

const { SystemError, ValidateError } = errors;
const { validateBlog } = validate;

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
    await handleApiError(response);
  }
};
