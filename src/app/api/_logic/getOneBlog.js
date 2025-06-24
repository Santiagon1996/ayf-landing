import { Blog } from "@/lib/db/models/index.js";
import { errors, validate } from "shared";

const { SystemError, NotFoundError, ValidateError } = errors;
const { validateId } = validate;

export const getOneblog = async (blogId) => {
  let validateBlogId;
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
    const blog = await Blog.findById(validateBlogId).lean();

    if (!blog) {
      throw new NotFoundError(`Blog with id ${validateBlogId} not found`);
    }

    return blog;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error; // Re-lanzar errores conocidos
    }
    throw new SystemError(error.message); // Transformar errores inesperados
  }
};
