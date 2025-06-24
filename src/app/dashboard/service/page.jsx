// app/dashboard/services/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useServices } from "@/hooks/useService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export default function ServicesPage() {
  const {
    data: services,
    loading,
    error,
    validationErrors,
    fetchServices,
    createService,
    updateService,
    deleteService,
    setError,
  } = useServices();
  // IMPORTANT: No longer destructure { toast } from a useToast hook from Shadcn UI.
  // Instead, directly use the 'toast' function imported from 'sonner'.

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [formState, setFormState] = useState({
    name: "",
    type: "",
    category: "",
    shortDescription: "",
    fullDescription: "",
    details: [],
    iconUrl: "",
  });
  const [detailsInput, setDetailsInput] = useState("");

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddDetail = () => {
    if (detailsInput.trim() !== "") {
      setFormState((prev) => ({
        ...prev,
        details: [...prev.details, detailsInput.trim()],
      }));
      setDetailsInput("");
    }
  };

  const handleRemoveDetail = (indexToRemove) => {
    setFormState((prev) => ({
      ...prev,
      details: prev.details.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleCreateClick = () => {
    setCurrentService(null);
    setFormState({
      name: "",
      type: "",
      category: "",
      shortDescription: "",
      fullDescription: "",
      details: [],
      iconUrl: "",
    });
    setDetailsInput("");
    setIsDialogOpen(true);
    setError(null);
  };

  const handleEditClick = (service) => {
    setCurrentService(service);
    setFormState({
      name: service.name || "",
      type: service.type || "",
      category: service.category || "",
      shortDescription: service.shortDescription || "",
      fullDescription: service.fullDescription || "",
      details: service.details || [],
      iconUrl: service.iconUrl || "",
    });
    setDetailsInput("");
    setIsDialogOpen(true);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success = false;
    let title = "";
    let description = "";

    const dataToSend = {};
    for (const key in formState) {
      if (key === "details") {
        dataToSend.details = formState.details;
      } else if (formState[key] !== "") {
        dataToSend[key] = formState[key];
      }
    }

    if (currentService) {
      success = await updateService(dataToSend, currentService.id);
      title = success ? "Éxito" : "Error";
      description = success
        ? "Servicio actualizado con éxito."
        : "Error al actualizar el servicio.";
    } else {
      success = await createService(dataToSend);
      title = success ? "Éxito" : "Error";
      description = success
        ? "Servicio creado con éxito."
        : "Error al crear el servicio.";
    }

    // Call Sonner's toast function
    if (success) {
      toast.success(description, { title });
    } else {
      toast.error(description, { title });
    }

    if (success) {
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este servicio?")
    ) {
      const success = await deleteService(serviceId);
      const title = success ? "Éxito" : "Error";
      const description = success
        ? "Servicio eliminado con éxito."
        : "Error al eliminar el servicio.";

      if (success) {
        toast.success(description, { title });
      } else {
        toast.error(description, { title });
      }
    }
  };

  if (loading) {
    return <p>Cargando servicios...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Gestión de Servicios</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <InfoCircledIcon className="h-4 w-4" />
          <AlertTitle>¡Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end mb-4">
        <Button onClick={handleCreateClick}>Crear Nuevo Servicio</Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción Corta</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No hay servicios disponibles.
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.type}</TableCell>
                  <TableCell>{service.category}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {service.shortDescription}
                  </TableCell>
                  <TableCell className="text-right flex space-x-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(service)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentService ? "Editar Servicio" : "Crear Nuevo Servicio"}
            </DialogTitle>
            <DialogDescription>
              {currentService
                ? "Realiza cambios en los detalles del servicio."
                : "Rellena los campos para añadir un nuevo servicio."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            {Object.keys(validationErrors).length > 0 && (
              <Alert variant="destructive">
                <InfoCircledIcon className="h-4 w-4" />
                <AlertTitle>Errores de Validación:</AlertTitle>
                <AlertDescription>
                  <ul>
                    {Object.entries(validationErrors).map(([field, msg]) => (
                      <li key={field}>
                        <strong>{field}:</strong> {msg}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={formState.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <Input
                id="type"
                value={formState.type}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoría
              </Label>
              <Input
                id="category"
                value={formState.category}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shortDescription" className="text-right">
                Descripción Corta
              </Label>
              <Textarea
                id="shortDescription"
                value={formState.shortDescription}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullDescription" className="text-right">
                Descripción Completa
              </Label>
              <Textarea
                id="fullDescription"
                value={formState.fullDescription}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="iconUrl" className="text-right">
                URL Icono
              </Label>
              <Input
                id="iconUrl"
                type="url"
                value={formState.iconUrl}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Detalles</Label>
              <div className="col-span-3 flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={detailsInput}
                    onChange={(e) => setDetailsInput(e.target.value)}
                    placeholder="Añadir detalle..."
                  />
                  <Button type="button" onClick={handleAddDetail}>
                    Añadir
                  </Button>
                </div>
                {formState.details.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {formState.details.map((detail, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center bg-gray-50 p-2 rounded"
                      >
                        {detail}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDetail(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          X
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">
                {currentService ? "Guardar Cambios" : "Crear Servicio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
