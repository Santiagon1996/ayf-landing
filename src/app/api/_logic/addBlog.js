import { Blog } from "@/lib/db/models/index.js";
import { ensureAdminAuth } from "@/lib/utils/ensureAdminAuth.js";
import { errors, validate } from "shared";
const { DuplicityError, SystemError, ValidateError } = errors;
const { validateBlog } = validate;
export const addBlog = async (blogData, adminId) => {
  let validatedAndParsedBlogData;

  try {
    validatedAndParsedBlogData = validateBlog(blogData);
  } catch (error) {
    console.error("Detalles de la validación fallida:", error.details);
    if (error instanceof ValidateError) {
      throw new ValidateError(
        "Validation failed for blog post data",
        error.details
      );
    }
    throw new SystemError(
      "Unexpected error during blog post validation.",
      error.message
    );
  }

  try {
    await ensureAdminAuth(adminId);
  } catch (error) {
    throw error;
  }

  let newBlog;
  try {
    console.log(
      "Attempting to create Blog with data:",
      validatedAndParsedBlogData
    );

    newBlog = await Blog.create(validatedAndParsedBlogData);

    console.log(
      "Blog created, Mongoose returned:",
      newBlog ? newBlog.toObject() : newBlog
    );

    return newBlog;
  } catch (error) {
    if (error.code === 11000) {
      let message = "Blog with this title or slug already exists.";
      if (error.keyPattern && error.keyPattern.title) {
        message = "Blog already exists with this title.";
      } else if (error.keyPattern && error.keyPattern.slug) {
        message = "Blog already exists with this slug.";
      }
      throw new DuplicityError(message);
    }
    if (error.name === "ValidationError") {
      const details = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));
      console.error("Mongoose Validation Failed Details:", details);

      throw new ValidateError(
        "Mongoose validation failed for blog post data",
        details
      );
    }
    // Para cualquier otro error inesperado de la base de datos
    console.error("Error inesperado al crear el Blog:", error); // Log para depuración interna
    throw new SystemError("Error creating blog post", error.message);
  }
};
