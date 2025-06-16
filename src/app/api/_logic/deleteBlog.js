import { Blog } from "@/lib/db/models/index.js";
import { errors, validate } from "shared";
import mongoose from "mongoose";

const { NotFoundError, SystemError } = errors;

const { validateId } = validate;

export const deleteBlog = async (adminId, blogId) => {
  // Validar el ID del administrador
  validateId(adminId);
  // Validar el ID del servicio
  validateId(blogId);

  let deletedBlog;
  try {
    // Buscar y eliminar la servicio por ID
    deletedBlog = await Blog.findByIdAndDelete(blogId);

    // Si no se encuentra el servico, lanzar un error
    if (!deletedBlog) {
      throw new NotFoundError("Blog not found");
    }
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error; // Re-lanzar errores esperados
    }
    if (error instanceof mongoose.Error.CastError) {
      throw new NotFoundError("Blog not found");
    }
    throw new SystemError(`Error deleting Blog: ${error.message}`);
  }
};
