import { Blog } from "@/lib/db/models/index.js";
import { errors, validate } from "shared";
import { updateBlogSchema } from "shared/validates/validate.js";
import { validateAndFilterUpdates } from "@/lib/utils/validateAndFilterUpdates";
import { ensureAdminAuth } from "@/lib/utils/ensureAdminAuth.js";

const { SystemError, ValidateError, NotFoundError } = errors;

const { validateId } = validate;

export const updateBlog = async (updatesData, adminId, blogId) => {
  // Validate admin ID
  validateId(adminId);
  // Validate blog ID
  validateId(blogId);

  let updates;
  try {
    updates = validateAndFilterUpdates(updatesData, updateBlogSchema);
  } catch (error) {
    if (error instanceof ValidateError) {
      throw new ValidateError(
        "Validation failed for blog updates",
        error.details
      );
    }
    throw new SystemError("Unexpected error during validation", error.message);
  }

  try {
    await ensureAdminAuth(adminId);
  } catch (error) {
    throw error;
  }

  let updatedBlog;

  try {
    updatedBlog = await Blog.findByIdAndUpdate(blogId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedBlog) {
      throw new NotFoundError("blog not found");
    }

    return updatedBlog;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error; // Re-lanzar errores esperados
    }
    throw new SystemError("Error updating blog", error.message);
  }
};
