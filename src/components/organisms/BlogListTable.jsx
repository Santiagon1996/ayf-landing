"use client";

import { useEffect, useState, useCallback } from "react";
import { useBlog } from "@/hooks/useBlog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICON_OPTIONS, ICON_NAMES } from "../icons/icons.js";

const CATEGORY_OPTIONS = [
  "juridico",
  "contable",
  "fiscal",
  "laboral",
  "noticias-generales",
];

export const BlogListTable = () => {
  const {
    data: blogs,
    loading,
    error,
    validationErrors,
    fetchData,
    createBlog,
    updateBlog,
    deleteBlog,
    setError,
  } = useBlog();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [formState, setFormState] = useState({
    title: "",
    category: "",
    description: "",
    content: "",
    author: "",
    iconUrl: "",
    viewsCount: 0,
  });
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [blogToDeleteId, setBlogToDeleteId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manejador genérico para inputs
  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [id]: id === "viewsCount" ? Number(value) || 0 : value,
    }));
  }, []);

  // Manejador específico para el Select de categoría
  const handleCategoryChange = useCallback((value) => {
    setFormState((prev) => ({ ...prev, category: value }));
  }, []);

  // Reiniciar el formulario y abrir el diálogo para crear
  const handleCreateClick = useCallback(() => {
    setCurrentBlog(null);
    setFormState({
      title: "",
      category: "",
      description: "",
      content: "",
      author: "",
      //iconUrl: "",
      viewsCount: 0, // Resetear viewsCount
    });
    setIsDialogOpen(true);
    setError(null);
  }, [setError]);

  // Cargar datos del blog para edición y abrir el diálogo
  const handleEditClick = useCallback(
    (blog) => {
      setCurrentBlog(blog);
      setFormState({
        title: blog.title || "",
        category: blog.category || "",
        description: blog.description || "",
        content: blog.content || "",
        author: blog.author || "",
        // iconUrl: blog.iconUrl || "",
        viewsCount: blog.viewsCount || 0,
      });
      setIsDialogOpen(true);
      setError(null);
    },
    [setError]
  );

  // Manejador para el envío del formulario (crear/actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const dataToSend = {};
    for (const key in formState) {
      // Incluir números siempre (como viewsCount, incluso si es 0)
      if (typeof formState[key] === "number") {
        dataToSend[key] = formState[key];
      }
      // Si es una cadena, la incluimos si no está vacía después de limpiar espacios
      else if (
        typeof formState[key] === "string" &&
        formState[key].trim() !== ""
      ) {
        dataToSend[key] = formState[key];
      }
    }

    let success;
    if (currentBlog) {
      success = await updateBlog(currentBlog.id, dataToSend);
    } else {
      success = await createBlog(dataToSend);
    }

    const title = success ? "Éxito" : "Error";
    const description = success
      ? `Blog ${currentBlog ? "actualizado" : "creado"} con éxito.`
      : `Error al ${currentBlog ? "actualizar" : "crear"} el blog.`;

    if (success) {
      toast.success(description, { title });
      setIsDialogOpen(false); // Cierra el diálogo solo en caso de éxito
    } else {
      toast.error(description, { title });
      // Los errores de validación ya se muestran en el Dialog por `validationErrors`
    }
  };

  // Manejador para eliminar un blog
  const handleDeleteClick = useCallback((blogId) => {
    setBlogToDeleteId(blogId);
    setIsConfirmingDelete(true);
  }, []);

  const confirmDeleteBlog = useCallback(async () => {
    setIsConfirmingDelete(false); // Cierra el diálogo de confirmación
    if (blogToDeleteId) {
      const success = await deleteBlog(blogToDeleteId);
      const title = success ? "Éxito" : "Error";
      const description = success
        ? "Blog eliminado con éxito."
        : "Error al eliminar el blog.";

      if (success) {
        toast.success(description, { title });
      } else {
        toast.error(description, { title });
      }
      setBlogToDeleteId(null); // Limpia el ID
    }
  }, [deleteBlog, blogToDeleteId]);

  if (loading) {
    return <p>Cargando blogs...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Gestión de Blogs</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <InfoCircledIcon className="h-4 w-4" />
          <AlertTitle>¡Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end mb-4">
        <Button onClick={handleCreateClick}>Crear Nuevo Blog</Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Título</TableHead>
              <TableHead>Categoría</TableHead>
              {/* Eliminadas las columnas de Contenido y Descripción de la tabla */}
              <TableHead>Autor</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  {" "}
                  {/* colSpan ajustado */}
                  No hay blogs disponibles.
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium">{blog.title}</TableCell>
                  <TableCell>{blog.category}</TableCell>
                  <TableCell>{blog.author}</TableCell>
                  <TableCell className="text-right flex space-x-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(blog)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(blog.id)}
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
              {currentBlog ? "Editar Blog" : "Crear Nuevo Blog"}
            </DialogTitle>
            <DialogDescription>
              {currentBlog
                ? "Realiza cambios en los detalles del blog."
                : "Rellena los campos para añadir un nuevo blog."}
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
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                value={formState.title}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            {/* Campo de Contenido (permanece en el diálogo) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                Contenido
              </Label>
              <Textarea
                id="content"
                value={formState.content}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            {/* Desplegable para Categoría (permanece en el diálogo) */}
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
            {/* Campo de Descripción (permanece en el diálogo) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={formState.description}
                onChange={handleChange}
                className="col-span-3"
                maxLength={500}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="author" className="text-right">
                Autor
              </Label>
              <Input
                id="author"
                type="text"
                value={formState.author}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="viewsCount" className="text-right">
                Vistas
              </Label>
              <Input
                id="viewsCount"
                type="number"
                value={formState.viewsCount}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">
                {currentBlog ? "Guardar Cambios" : "Crear Blog"}
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
              ¿Estás seguro de que quieres eliminar este blog? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmingDelete(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteBlog} // Llama a la nueva función de confirmación
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
