// src/hooks/useServices.js

import { useState, useCallback } from "react";
import {
  getServicesRequest,
  createServiceRequest,
  updateServiceRequest,
  deleteServiceRequest,
  getServiceByIdRequest,
} from "@/app/_logic/servicesRequest"; // Asegúrate de la ruta correcta
import { errors } from "shared"; // Asegúrate de la ruta correcta

export const useServices = () => {
  const [data, setData] = useState([]); // Para almacenar la lista de servicios
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({}); // Para errores de formularios

  // Función para obtener todos los servicios
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getServicesRequest();
      setData(result.services); // Asumiendo que tu API devuelve { services: [...] }
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
      return result; // Devuelve el servicio encontrado
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
      const newService = await createServiceRequest(serviceData);
      setData((prevData) => [...prevData, newService]); // Actualiza la lista localmente
      return true;
    } catch (err) {
      console.error("Error creating service:", err);
      if (err instanceof errors.ValidateError) {
        setValidationErrors(err.details || {});
        setError("Error de validación al crear servicio.");
      } else {
        setError(err.message || "Error al crear el servicio.");
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar un servicio
  const updateService = useCallback(async (id, serviceData) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});
    try {
      const updatedService = await updateServiceRequest(id, serviceData);
      setData((prevData) =>
        prevData.map((s) => (s.id === id ? updatedService : s))
      ); // Actualiza la lista localmente
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
  }, []);

  // Función para eliminar un servicio
  const deleteService = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteServiceRequest(id);
      setData((prevData) => prevData.filter((s) => s.id !== id)); // Elimina de la lista localmente
      return true;
    } catch (err) {
      console.error("Error deleting service:", err);
      setError(err.message || "Error al eliminar el servicio.");
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
    fetchServices,
    fetchServiceById,
    createService,
    updateService,
    deleteService,
    setError, // Para permitir limpiar errores desde el componente
  };
};
