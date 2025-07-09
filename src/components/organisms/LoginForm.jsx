"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import { useLoginUser } from "@/hooks/useLoginUser";

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
  });
  const [checkingCookie, setCheckingCookie] = useState(true);

  // Check login status on component mount

  useEffect(() => {
    // Verificar si la cookie accessToken está presente
    const hasAccessToken =
      typeof document !== "undefined" &&
      document.cookie.includes("accessToken=");

    if (hasAccessToken) {
      // Si la cookie está presente, redirige al dashboard.
      // Usa replace para que no puedan volver al login con el botón de atrás.
      router.replace("/dashboard");
    } else {
      setCheckingCookie(false); // No hay cookie, mostrar el formulario de login
    }
  }, [router]);

  if (checkingCookie) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">Cargando...</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Attempt to register the user via the hook
    const isSuccess = await loginUser(formData);

    if (isSuccess) {
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "Bienvenido",
        confirmButtonText: "OK",
      }).then(() => {
        router.replace("/dashboard"); // Redirect after user acknowledges success
      });
      setFormData({ name: "", password: "" });
    } else {
      // Handle general errors (network, duplication, system errors) from the hook
      // Field-specific validation errors are handled by validationErrors state
      if (error) {
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
