"use client";
import { loginUserRequest } from "@/app/_logic/loginUserRequest.js";
import { useState } from "react";
import { errors } from "shared";

const { ValidateError, CredentialsError, SystemError, NotFoundError } = errors;
export const useLoginUser = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Intenta autenticar al user.
   * @param {object} userData - Objeto que contiene { name, password }.
   * @returns {boolean} True si el login fue exitoso, false en caso contrario.
   */
  const loginUser = async (userData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setValidationErrors({});

    try {
      await loginUserRequest(userData);
      setSuccess(true);
      return true;
    } catch (error) {
      console.error("Error en useLoginUser:", error);

      if (error instanceof ValidateError) {
        setValidationErrors(error.details || {});
        setError("Por favor, corrige los errores de validación.");
      } else if (error instanceof NotFoundError) {
        setError("Usuario o contraseña incorrectos.");
      } else if (error instanceof CredentialsError) {
        setError("Credenciales inválidas. Verifica tu usuario y contraseña.");
      } else if (error instanceof errors.SystemError) {
        setError(
          error.message ||
            "Ha ocurrido un error en el sistema. Por favor, inténtalo de nuevo más tarde."
        );
      } else {
        console.error("Error inesperado (useLoginUser):", error);
        setError(
          "Ocurrió un error desconocido. Por favor, contacta a soporte."
        );
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Devuelve la función y los estados
  return { loginUser, error, loading, success, validationErrors };
};
