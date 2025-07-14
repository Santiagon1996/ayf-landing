import { validate, errors } from "shared";
import { handleApiError } from "@/lib/handlers/handleApiError";

const { SystemError, ValidateError } = errors;
const { validateId } = validate;

export const deleteBlogRequest = async (blogId) => {
  let response;
  let body;
  let validatedBlogId;

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
    response = await fetch(`/api/blogs/${blogId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    throw new SystemError("Error al eliminar el blog", error.message);
  }

  if (response.status === 204) {
    return { success: true, message: "Blog eliminado correctamente" };
  }

  if (!response.ok) {
    await handleApiError(response);
  }
};
