"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import { useLoginUser } from "@/hooks/useLoginUser";
import { isUserLoggedIn } from "@/lib/utils/isUserLoggedIn";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const LoginForm = () => {
  const { loginUser, error, loading, success, validationErrors } =
    useLoginUser();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });

  // Check login status on component mount

  useEffect(() => {
    const checkLoginAndRedirect = async () => {
      try {
        const loggedIn = await isUserLoggedIn();
        if (loggedIn) {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error(
          "Error al verificar el estado de login (SystemError):",
          err.message
        );
      }
    };
    checkLoginAndRedirect();
  }, [router]);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation for password mismatch BEFORE API call
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "¡Error de Validación!", // More specific title
        text: "Las contraseñas no coinciden.",
        confirmButtonText: "OK",
      });
      return; // Stop function execution
    }

    // Attempt to register the user via the hook
    const isSuccess = await loginUser(formData);

    if (isSuccess) {
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Bienvenido",
        confirmButtonText: "OK",
      }).then(() => {
        router.push("/dashboard"); // Redirect after user acknowledges success
      });
      setFormData({ name: "", password: "", confirmPassword: "" }); // Clear form on success
    } else {
      // Handle general errors (network, duplication, system errors) from the hook
      // Field-specific validation errors are handled by validationErrors state
      if (error) {
        // The 'error' state from useRegisterUser
        Swal.fire({
          icon: "error",
          title: "¡Error en el login", // General error title
          text: error, // Display the error message from the hook
          confirmButtonText: "OK",
        });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg"
    >
      <h2 className="text-2xl font-bold text-center mb-6">Login de Usuario</h2>

      {/* Name Field */}
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
          className={
            validationErrors.name
              ? "border-red-500 focus-visible:ring-red-500"
              : ""
          }
        />
        {validationErrors.name && (
          <p className="text-sm text-red-500 mt-1">{validationErrors.name}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          className={
            validationErrors.password
              ? "border-red-500 focus-visible:ring-red-500"
              : ""
          }
        />
        {validationErrors.password && (
          <p className="text-sm text-red-500 mt-1">
            {validationErrors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="confirmPassword">Confirma Contraseña</Label>
        <Input
          type="password"
          id="confirmPassword" // Unique ID
          name="confirmPassword" // Unique name
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={loading}
          // Optional: Add specific validation error class if your Zod schema handles confirmPassword as a separate field
          // className={validationErrors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {/* Optional: Display specific confirmPassword error if available from validationErrors */}
        {/* {validationErrors.confirmPassword && (
          <p className="text-sm text-red-500 mt-1">{validationErrors.confirmPassword}</p>
        )} */}
      </div>

      {/* Link to Login page */}
      <p className="text-center text-sm text-gray-600">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Registrate
        </Link>
      </p>

      {/* Submit Button */}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Autenticando..." : "Autenticarse"}
      </Button>
    </form>
  );
};
