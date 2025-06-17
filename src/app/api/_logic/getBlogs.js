import { Blog } from "@/lib/db/models/index.js";
import { errors } from "shared";

const { SystemError, NotFoundError } = errors;

export const getBlogs = async () => {
  let blog;
  try {
    blog = await Blog.find()
      .select("-__v")
      .sort("title") // Ordena alfabéticamente por título
      .lean();

    console.log("Propiedades encontradas:", blog.length); // Útil para ver cuántas se devuelven

    // Procesa las propiedades para formatear los datos
    blog.forEach((blog) => {
      blog.id = blog._id.toString();
      delete blog._id;
    });

    // Si no se encuentran propiedades, lanza un error
    if (blog.length === 0) {
      throw new NotFoundError("No blog found");
    }
    return blog;
  } catch (error) {
    // Manejo de errores
    if (error instanceof NotFoundError) {
      throw error; // Lanza el error original
    }
    throw new SystemError(`Error fetching blog: ${error.message}`);
  }
};
