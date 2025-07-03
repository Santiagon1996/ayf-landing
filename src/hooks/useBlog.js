import { useState, useCallback, useEffect } from "react";
import {
  getBlogRequest,
  createBlogRequest,
  updateBlogRequest,
  deleteBlogRequest,
  getBlogByIdRequest,
} from "@/app/_logic/index";
import { errors } from "shared";
import Swal from "sweetalert2";

const { ValidateError, NotFoundError, SystemError } = errors;

export const useBlog = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Función para obtener todos los blogs
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getBlogRequest();
      setData(result);
      return true;
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError(err.message || "Error al cargar los blogs.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  // Función para obtener un blog por ID
  const fetchBlogById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getBlogByIdRequest(id);
      return result; // Devuelve el blog encontrado
    } catch (err) {
      console.error("Error fetching blog by ID:", err);
      setError(err.message || "Error al cargar el blog.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para crear un blog
  const createBlog = useCallback(
    async (blogData) => {
      setLoading(true);
      setError(null);
      setValidationErrors({});
      try {
        await createBlogRequest(blogData);
        await fetchData();
        return true;
      } catch (err) {
        console.error("Error creating blog:", err);

        if (err instanceof ValidateError) {
          setValidationErrors(err.details || {});
          setError("Error de validación al crear blog.");
        } else {
          setError(err.message || "Error al crear el blog.");
        }
        return false; // Indica fallo
      } finally {
        setLoading(false);
      }
    },
    [fetchData, setError, setValidationErrors]
  );

  // Función para actualizar un blog
  const updateBlog = useCallback(
    async (blogId, blogData) => {
      setLoading(true);
      setError(null);
      setValidationErrors({});
      try {
        await updateBlogRequest(blogId, blogData);
        await fetchData(); // Refresca la lista de blogs después de actualizar
        return true;
      } catch (err) {
        console.error("Error updating blog:", err);
        if (err instanceof ValidateError) {
          setValidationErrors(err.details || {});
          setError("Error de validación al actualizar blog.");
        } else {
          setError(err.message || "Error al actualizar el blog.");
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchData, setError, setValidationErrors]
  );

  // Función para eliminar un blog
  const deleteBlog = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        await deleteBlogRequest(id);
        await fetchData(); // Refresca la lista de blogs después de eliminar
        return true;
      } catch (err) {
        console.error("Error deleting blog:", err);
        // Asumiendo que err puede ser un objeto o una cadena
        setError(err.message || String(err) || "Error al eliminar el blog.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchData, setError]
  );

  // Este useEffect es donde se manejan los errores para SweetAlert
  useEffect(() => {
    if (error) {
      let errorMessage = "Ocurrió un error inesperado.";
      let errorDetails = null; // Para guardar los detalles de validación

      if (error instanceof ValidateError) {
        errorMessage = error.message || "Error de validación.";
        errorDetails = error.details; // Captura los detalles del ValidateError

        if (errorDetails && errorDetails.length > 0) {
          // Construye un mensaje más detallado para el SweetAlert
          errorMessage += "\n\nDetalles:";
          errorDetails.forEach((detail) => {
            errorMessage += `\n- ${detail.field}: ${detail.message}`;
          });
        }
      } else if (error instanceof NotFoundError) {
        errorMessage = error.message || "Recurso no encontrado.";
      } else if (error instanceof SystemError) {
        errorMessage = error.message || "Error interno del sistema.";
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage, // Aquí se muestra el mensaje detallado
        confirmButtonText: "OK",
        customClass: {
          popup: "text-left", // Alinea el texto a la izquierda si tiene detalles
        },
      });
      setError(null); // Limpia el error después de mostrarlo para evitar bucles
    }
  }, [error, setError]);

  return {
    data,
    loading,
    error,
    validationErrors,
    fetchData,
    fetchBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    setError, // Para permitir limpiar errores desde el componente
  };
};
