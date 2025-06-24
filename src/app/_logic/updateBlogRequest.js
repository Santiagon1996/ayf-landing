import { validate, errors } from "shared";
import { validateAndFilterUpdates } from "@/lib/utils/validateAndFilterUpdates";

const { SystemError, ValidateError } = errors;
const { validateId } = validate;

export const updateBlogRequest = async (updatesData, adminId, blogId) => {
  let validatedUpdatedBlog;
  let validateAdminId;
  let validatedBlogId;
  let body;
  let response;

  try {
    validateAdminId = validateId(adminId);
  } catch (error) {
    console.error("Detalles de la validación fallida:", error.details);
    if (error instanceof ValidateError) {
      throw new ValidateError("Validation failed for ", error.details);
    }
    throw new SystemError("Validation failed for user ID", error.message);
  }

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
    validatedUpdatedBlog = validateAndFilterUpdates(updatesData);
  } catch (error) {
    console.error('"Detalles de la validación fallida:", error.details');
    if (error instanceof ValidateError) {
      throw new ValidateError("Validation failed for ", error.details);
    }
    throw new SystemError("Validation failed for user ID", error.message);
  }

  try {
    response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blog/${blogId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    throw new SystemError("Error al editar el blog", error.message);
  }
  if (response.status === 204) {
    return { success: true, message: "Blog editado correctamente" };
  }

  if (!response.ok) {
    try {
      body = await response.json();
    } catch (error) {
      throw new SystemError(
        `Error al editar blog (status ${response.status})`,
        error.message
      );
    }

    const { error, message } = body;
    const ErrorConstructor = errors[error];
    throw new ErrorConstructor(message);
  }
};
