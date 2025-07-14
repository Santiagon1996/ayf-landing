"use client";

import { useEffect, useState, useCallback } from "react";
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
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICON_OPTIONS, ICON_NAMES } from "../icons/icons.js";

const CATEGORY_OPTIONS = [
  "asesoria-jurídica",
  "area-contable-fiscal",
  "area-financiera",
  "servicios-complementarios",
];
const TYPE_OPTIONS = ["jurídico", "contable"];
export const ServiceListTable = () => {
  const {
    data: services,
    loading,
    error,
    validationErrors,
    fetchData,
    createService,
    updateService,
    deleteService,
    setError,
  } = useServices();

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
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [serviceToDeleteId, setServiceToDeleteId] = useState(null); // o blogToDeleteId

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  // Manejador para manejar cambios en los campos del formulario
  // Este manejador se usa para actualizar el estado del formulario cuando el usuario escribe en los campos
  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormState((prev) => ({ ...prev, [id]: value }));
  }, []);

  // Manejador específico para el Select de categoría
  const handleCategoryChange = useCallback((value) => {
    setFormState((prev) => ({ ...prev, category: value }));
  }, []);

  // Manejador específico para el Select de Type
  const handleTypeChange = useCallback((value) => {
    setFormState((prev) => ({ ...prev, type: value }));
  }, []);

  //Manejo de detalles
  const handleAddDetail = useCallback(() => {
    if (detailsInput.trim() !== "") {
      setFormState((prev) => ({
        ...prev,
        details: [...prev.details, detailsInput.trim()],
      }));
      setDetailsInput("");
    }
  }, [detailsInput]);
  // Manejador para eliminar un detalle específico
  const handleRemoveDetail = useCallback((indexToRemove) => {
    setFormState((prev) => ({
      ...prev,
      details: prev.details.filter((_, index) => index !== indexToRemove),
    }));
  }, []);
  //Manejador para crear un nuevo servicio
  // Este manejador se usa para abrir el diálogo de creación de un nuevo servicio
  const handleCreateClick = useCallback(() => {
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
  }, [setError]);
  // Manejador para editar un servicio existente
  // Este manejador se usa para abrir el diálogo de edición de un servicio existente
  const handleEditClick = useCallback(
    (service) => {
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
    },
    [setError]
  );
  // Manejador para el submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpiar errores de validación anteriores al intentar el submit

    const dataToSend = {};
    for (const key in formState) {
      if (key === "details") {
        dataToSend.details = formState.details;
      } else if (formState[key] !== "" && formState[key] !== null) {
        dataToSend[key] = formState[key];
      }
    }

    try {
      let success;
      if (currentService) {
        success = await updateService(dataToSend, currentService.id);
      } else {
        success = await createService(dataToSend);
      }

      // Lógica de toast unificada
      const title = success ? "Éxito" : "Error";
      const description = success
        ? `Servicio ${currentService ? "actualizado" : "creado"} con éxito.`
        : `Error al ${currentService ? "actualizar" : "crear"} el servicio.`;

      if (success) {
        toast.success(description, { title });
        setIsDialogOpen(false); // Cierra el diálogo solo en caso de éxito
      } else {
        toast.error(description, { title });
        // Los errores de validación ya se muestran en el Dialog por `validationErrors`
      }
    } catch (err) {
      console.error("Error inesperado al enviar el blog:", err);
      toast.error("Error inesperado al enviar el formulario.", {
        title: "Error",
      });
      setError("Ocurrió un error inesperado. Revisa la consola.");
    }
  };
  // Manejador para abrir el diálogo de confirmación de eliminación
  const handleDeleteClick = useCallback((serviceId) => {
    setServiceToDeleteId(serviceId);
    setIsConfirmingDelete(true);
  }, []);
  // Manejador para confirmar la eliminación de un servicio
  const confirmDeleteService = useCallback(async () => {
    setIsConfirmingDelete(false); // Cierra el diálogo de confirmación
    if (serviceToDeleteId) {
      const success = await deleteService(serviceToDeleteId);
      const title = success ? "Éxito" : "Error";
      const description = success
        ? "Servicio eliminado con éxito."
        : "Error al eliminar el servicio.";

      if (success) {
        toast.success(description, { title });
      } else {
        toast.error(description, { title });
      }
      setServiceToDeleteId(null); // Limpia el ID
    }
  }, [deleteService, serviceToDeleteId]);

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
                      onClick={() => handleDeleteClick(service.id)}
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
              <Label htmlFor="category" className="text-right">
                Tipo
              </Label>
              <Select value={formState.type} onValueChange={handleTypeChange}>
                <SelectTrigger id="category" className="col-span-3">
                  <SelectValue placeholder="Selecciona un Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() +
                        option.slice(1).replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoría
              </Label>
              <Select
                value={formState.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="category" className="col-span-3">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() +
                        option.slice(1).replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                Icono
              </Label>
              <Select
                value={formState.iconUrl} // El valor será el nombre del icono, ej: "Blog"
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, iconUrl: value }))
                }
              >
                <SelectTrigger id="iconUrl" className="col-span-3">
                  <SelectValue placeholder="Selecciona un icono" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {" "}
                  {/* Para muchos iconos */}
                  {ICON_NAMES.map((iconName) => {
                    const IconComponent = ICON_OPTIONS[iconName]; // Obtén el componente del icono
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          {IconComponent && (
                            <IconComponent className="h-4 w-4" />
                          )}{" "}
                          {/* Muestra el icono */}
                          {iconName}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
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
      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este elemento? Esta acción
              no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmingDelete(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteService}>
              {" "}
              {/* Ajusta aquí si es para Service o Blog */}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
