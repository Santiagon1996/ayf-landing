import { useState, useCallback } from "react";
import {
  getBlogRequest,
  createBlogRequest,
  updateBlogRequest,
  deleteBlogRequest,
  getBlogByIdRequest,
} from "@/app/_logic/index";
import { errors } from "shared";

export const useBlog = () => {
  const [data, setData] = useState([]); // Para almacenar la lista de blogs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({}); // Para errores de formularios

  // Función para obtener todos los blogs
  const fetchBlog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getBlogRequest();
      setData(result.blogs); // Asumiendo que tu API devuelve { blogs: [...] }
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
  const createBlog = useCallback(async (blogData) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});
    try {
      const newService = await createBlogRequest(blogData);
      setData((prevData) => [...prevData, newService]); // Actualiza la lista localmente
      return true;
    } catch (err) {
      console.error("Error creating blog:", err);
      if (err instanceof errors.ValidateError) {
        setValidationErrors(err.details || {});
        setError("Error de validación al crear blog.");
      } else {
        setError(err.message || "Error al crear el blog.");
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar un blog
  const updateBlog = useCallback(async (id, blogData) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});
    try {
      const updatedService = await updateBlogRequest(id, blogData);
      setData((prevData) =>
        prevData.map((s) => (s.id === id ? updatedService : s))
      ); // Actualiza la lista localmente
      return true;
    } catch (err) {
      console.error("Error updating blog:", err);
      if (err instanceof errors.ValidateError) {
        setValidationErrors(err.details || {});
        setError("Error de validación al actualizar blog.");
      } else {
        setError(err.message || "Error al actualizar el blog.");
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para eliminar un blog
  const deleteBlog = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteServiceRequest(id);
      setData((prevData) => prevData.filter((s) => s.id !== id)); // Elimina de la lista localmente
      return true;
    } catch (err) {
      console.error("Error deleting blog:", err);
      setError(err.message || "Error al eliminar el blog.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    validationErrors,
    fetchBlog,
    fetchBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    setError, // Para permitir limpiar errores desde el componente
  };
};
