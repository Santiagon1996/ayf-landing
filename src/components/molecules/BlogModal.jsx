// src/components/molecules/BlogModal.jsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
//import { Separator } from "@/components/ui/separator";
//import IconRenderer from "@/components/atoms/IconRenderer";
import { IoHeartSharp } from "react-icons/io5";
import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Molécula: Modal de detalles de un Blog.
 * @param {boolean} isOpen - Estado de apertura del modal.
 * @param {function} onClose - Función para cerrar el modal.
 * @param {object} blog - El objeto de datos del blog seleccionado.
 */
const BlogModal = ({ isOpen, onClose, blog }) => {
  if (!blog) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-3xl font-bold">
              {blog.title}
            </DialogTitle>
            {/* {blog.iconUrl && ( // Usa iconUrl
              <IconRenderer
                iconName={blog.iconUrl} // Pasa iconUrl a iconName prop de IconRenderer
                className="h-10 w-10 text-primary ml-4"
              />
            )} */}
          </div>
          <DialogDescription className="flex flex-wrap items-center gap-2 mb-4">
            {blog.category && (
              <Badge variant="secondary">
                {blog.category.charAt(0).toUpperCase() +
                  blog.category.slice(1).replace("-", " ")}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Información de Autor y Fecha de Publicación */}
          {(blog.author || blog.publishedAt) && ( // Usa publishedAt
            <div className="text-sm text-gray-500 mb-4 flex justify-between items-center">
              {blog.author && <p>Autor: {blog.author}</p>}
              {blog.publishedAt && ( // Usa publishedAt
                <p>
                  Publicado el:{" "}
                  {format(
                    new Date(blog.publishedAt),
                    "dd 'de' MMMM 'de' yyyy",
                    {
                      locale: es,
                    }
                  )}
                </p>
              )}
            </div>
          )}

          {blog.content && ( // Usa content
            <>
              <h3 className="text-lg font-semibold mb-2">
                Descripción Completa
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {blog.content}
              </p>
            </>
          )}

          {/* Contador de Vistas en el modal (puramente visual) */}
          {blog.viewsCount !== undefined && ( // Usa viewsCount
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <IoHeartSharp className="h-5 w-5 text-red-500 mr-1" />
              <span>{blog.viewsCount} Me gusta</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlogModal;
