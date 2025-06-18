// src/components/dashboard/ServiceListTable.jsx
"use client";

import { useEffect } from "react";
import { useServices } from "@/hooks/useServices";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Edit, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export const ServiceListTable = () => {
  const {
    data: services,
    loading,
    error,
    fetchServices,
    deleteService,
    setError,
  } = useServices();

  useEffect(() => {
    fetchServices(); // Carga los servicios al montar el componente
  }, [fetchServices]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error,
        confirmButtonText: "OK",
      });
      setError(null); // Limpia el error después de mostrarlo
    }
  }, [error, setError]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminarlo!",
    });

    if (result.isConfirmed) {
      const success = await deleteService(id);
      if (success) {
        Swal.fire("¡Eliminado!", "El servicio ha sido eliminado.", "success");
      } else {
        // El error ya se muestra por el useEffect de error
      }
    }
  };

  if (loading)
    return (
      <div className="text-center p-4">
        <Loader2 className="animate-spin" size={24} /> Cargando servicios...
      </div>
    );
  if (!services || services.length === 0)
    return (
      <div className="text-center p-4">
        No hay servicios para mostrar.{" "}
        <Button onClick={() => console.log("Open create form")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Servicio
        </Button>
      </div>
    );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Gestión de Servicios</h2>
        <Button onClick={() => console.log("Open create form")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Servicio
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell>{service.description}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2"
                  onClick={() => console.log("Open edit form for", service.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(service.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
