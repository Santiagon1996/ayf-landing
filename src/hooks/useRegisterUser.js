"use client";
import { registerUserRequest } from "@/app/_logic/registerUserRequest.js";
import { useState } from "react";
import { errors } from "shared";

const { ValidateError, DuplicityError, SystemError } = errors;
export const useRegisterUser = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Intenta registrar un nuevo usuario.
   * @param {object} userData - Objeto que contiene { name, email, password }.
   * @returns {boolean} True si el registro fue exitoso, false en caso contrario.
   */
  const registerUser = async (userData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setValidationErrors({});

    try {
      // Llama a la función que realiza la solicitud de registro
      await registerUserRequest(userData);
      setSuccess(true);
      return true; // Indica que el registro fue exitoso
    } catch (err) {
      if (err instanceof ValidateError) {
        // Errores de validación (del lado del cliente o del servidor Mongoose)
        console.error("Error de validación (useRegisterUser):", err.details);
        setError("Por favor, corrige los errores de validación.");
        // Mapea los detalles de error a un formato fácil de usar por campo
        const fieldErrors = {};
        err.details.forEach((detail) => {
          fieldErrors[detail.field] = detail.message;
        });
        setValidationErrors(fieldErrors);
      } else if (err instanceof DuplicityError) {
        // Error de usuario duplicado
        console.error("Error de duplicidad (useRegisterUser):", err.message);
        setError(err.message); // Muestra el mensaje específico de duplicidad
      } else if (err instanceof SystemError) {
        // Errores de sistema, de red o inesperados
        console.error("Error del sistema (useRegisterUser):", err.message);
        setError("Ocurrió un error inesperado. Inténtalo de nuevo más tarde.");
      } else {
        // Otros errores no reconocidos
        console.error("Error inesperado (useRegisterUser):", err);
        setError(
          "Ocurrió un error desconocido. Por favor, contacta a soporte."
        );
      }
      return false; // Indica que hubo un error en el registro
    } finally {
      setLoading(false); // Finaliza el estado de carga
    }
  };

  // Devuelve la función y los estados
  return { registerUser, error, loading, success, validationErrors };
};
