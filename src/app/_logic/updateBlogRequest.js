import { validate, errors } from "shared";
import { validateAndFilterUpdates } from "@/lib/utils/validateAndFilterUpdates";
import { handleApiError } from "@/lib/handlers/handleApiError";

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
    throw new SystemError("Validation failed for Blog ID", error.message);
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
    await handleApiError(response);
  }
};
