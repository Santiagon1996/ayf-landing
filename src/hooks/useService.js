import { useState, useCallback, useEffect } from "react";
import {
  getServiceRequest,
  createServiceRequest,
  updateServiceRequest,
  deleteServiceRequest,
  getServiceByIdRequest,
} from "@/app/_logic/index.js"; // Asegúrate que esta ruta es correcta
import { errors } from "shared";
import Swal from "sweetalert2";

export const useServices = () => {
  const [data, setData] = useState([]); // Para almacenar la lista de servicios
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({}); // Para errores de formularios

  // Función para obtener todos los servicios
  // Marcada con useCallback y como dependencia para las otras funciones
  const fetchServices = useCallback(async () => {
    setLoading(true);
    +setError(null);
    try {
      const result = await getServiceRequest();
      setData(result);
      return true;
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(err.message || "Error al cargar los servicios.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener un servicio por ID
  const fetchServiceById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getServiceByIdRequest(id);
      return result;
    } catch (err) {
      console.error("Error fetching service by ID:", err);
      setError(err.message || "Error al cargar el servicio.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para crear un servicio
  const createService = useCallback(async (serviceData) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});
    try {
      const response = await createServiceRequest(serviceData);
      if (response.success && response.service) {
        setData((prevData) => [...prevData, response.service]);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error creating service:", err);
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar un servicio
  const updateService = useCallback(
    async (updatesData, serviceId) => {
      setLoading(true);
      setError(null);
      setValidationErrors({});
      try {
        await updateServiceRequest(updatesData, serviceId);
        // Si el backend no devuelve el objeto actualizado, debemos refetch
        await fetchServices(); // <--- ¡AQUÍ ESTÁ LA CLAVE! Volvemos a cargar todo.
        return true;
      } catch (err) {
        console.error("Error updating service:", err);
        if (err instanceof errors.ValidateError) {
          setValidationErrors(err.details || {});
          setError("Error de validación al actualizar servicio.");
        } else {
          setError(err.message || "Error al actualizar el servicio.");
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchServices]
  ); // Añadir fetchServices a las dependencias porque lo usamos aquí

  // Función para eliminar un servicio
  const deleteService = useCallback(
    async (serviceId) => {
      setLoading(true);
      setError(null);
      try {
        await deleteServiceRequest(serviceId);
        // Si el backend no devuelve el objeto, debemos refetch
        await fetchServices(); // <--- ¡AQUÍ ESTÁ LA CLAVE! Volvemos a cargar todo.
        return true;
      } catch (err) {
        console.error("Error deleting service:", err);
        setError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchServices]
  ); // Añadir fetchServices a las dependencias porque lo usamos aquí

  // Este useEffect es donde se manejan los errores para SweetAlert
  useEffect(() => {
    if (error) {
      let errorMessage = "Ocurrió un error inesperado.";
      let errorDetails = null; // Para guardar los detalles de validación

      if (error instanceof errors.ValidateError) {
        errorMessage = error.message || "Error de validación.";
        errorDetails = error.details; // Captura los detalles del ValidateError

        if (errorDetails && errorDetails.length > 0) {
          // Construye un mensaje más detallado para el SweetAlert
          errorMessage += "\n\nDetalles:";
          errorDetails.forEach((detail) => {
            errorMessage += `\n- ${detail.field}: ${detail.message}`;
          });
        }
      } else if (error instanceof errors.NotFoundError) {
        errorMessage = error.message || "Recurso no encontrado.";
      } else if (error instanceof errors.SystemError) {
        errorMessage = error.message || "Error interno del sistema.";
      } else {
        // Fallback para cualquier otro tipo de error de JS
        errorMessage = `Error: ${
          error.message || "Mensaje de error no disponible."
        }`;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage, // Aquí se muestra el mensaje detallado
        confirmButtonText: "OK",
        customClass: {
          // Puedes añadir estilos CSS para mejorar la legibilidad si el texto es largo
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
    fetchServices,
    fetchServiceById,
    createService,
    updateService,
    deleteService,
    setError, // Para permitir limpiar errores desde el componente
  };
};
