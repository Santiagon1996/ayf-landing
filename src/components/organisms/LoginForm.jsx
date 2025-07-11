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

  useEffect(() => {
    const hasAccessToken =
      typeof document !== "undefined" &&
      document.cookie.includes("accessToken=");

    if (hasAccessToken) {
      router.replace("/dashboard");
      setCheckingCookie(true);
    } else {
      setCheckingCookie(false);
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
      router.replace("/dashboard");
      router.refresh();

      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      setFormData({ name: "", password: "" });
    } else {
      if (error) {
        Swal.fire({
          icon: "error",
          title: "¡Error en el login",
          text: error,
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
