import { useState, useCallback } from "react";
import {
  getServiceRequest,
  createServiceRequest,
  updateServiceRequest,
  deleteServiceRequest,
  getServiceByIdRequest,
} from "@/app/_logic/index.js";
import { errors } from "shared";

export const useServices = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Obtener todos los servicios
  const fetchData = useCallback(async (type) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getServiceRequest(type);
      setData(result || []);
      return result;
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(err.message || "Error al cargar los servicios.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener servicio por ID
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

  // Crear servicio
  const createService = useCallback(
    async (serviceData) => {
      setLoading(true);
      setError(null);
      setValidationErrors({});
      try {
        await createServiceRequest(serviceData);
        await fetchData(); // Recarga servicios
        return true;
      } catch (err) {
        console.error("Error creating service:", err);

        if (err instanceof errors.ValidateError) {
          setValidationErrors(
            Array.isArray(err.details)
              ? Object.fromEntries(err.details.map((d) => [d.field, d.message]))
              : err.details
          );
          setError("Error de validación al crear servicio.");
        } else {
          setError(err.message || "Error al crear el servicio.");
        }

        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchData]
  );

  // Actualizar servicio
  const updateService = useCallback(
    async (serviceId, updatesData) => {
      setLoading(true);
      setError(null);
      setValidationErrors({});
      try {
        await updateServiceRequest(serviceId, updatesData);
        await fetchData();
        return true;
      } catch (err) {
        console.error("Error updating service:", err);

        if (err instanceof errors.ValidateError) {
          setValidationErrors(
            Array.isArray(err.details)
              ? Object.fromEntries(err.details.map((d) => [d.field, d.message]))
              : err.details
          );
          setError("Error de validación al actualizar servicio.");
        } else {
          setError(err.message || "Error al actualizar el servicio.");
        }

        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchData]
  );

  // Eliminar servicio
  const deleteService = useCallback(
    async (serviceId) => {
      setLoading(true);
      setError(null);
      try {
        await deleteServiceRequest(serviceId);
        await fetchData();
        return true;
      } catch (err) {
        console.error("Error deleting service:", err);
        setError(err.message || "Error al eliminar el servicio.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchData]
  );

  return {
    data,
    loading,
    error,
    validationErrors,
    fetchData,
    fetchServiceById,
    createService,
    updateService,
    deleteService,
    setError,
  };
};
