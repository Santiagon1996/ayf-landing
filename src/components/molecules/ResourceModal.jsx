// src/components/molecules/ResourceModal.jsx
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
import { Separator } from "@/components/ui/separator";
import IconRenderer from "@/components/atoms/IconRenderer"; // Importa el átomo
import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Molécula: Modal de detalles de un recurso.
 * @param {boolean} isOpen - Estado de apertura del modal.
 * @param {function} onClose - Función para cerrar el modal.
 * @param {object} resource - El objeto de datos del recurso seleccionado.
 * @param {string} titleKey - Clave para el título.
 * @param {string} categoryKey - Clave para la categoría.
 * @param {string} typeKey - Clave para el tipo.
 * @param {string} fullDescriptionKey - Clave para la descripción completa.
 * @param {string} detailsKey - Clave para el array de detalles (opcional).
 * @param {string} iconKey - Clave para el nombre del icono.
 * @param {string} authorKey - Clave para el autor (opcional, para blogs).
 * @param {string} publishDateKey - Clave para la fecha de publicación (opcional, para blogs).
 * @param {string} viewsCountKey - Clave para el contador de vistas (opcional, para blogs).
 */
const ResourceModal = ({
  isOpen,
  onClose,
  resource,
  titleKey,
  categoryKey,
  typeKey,
  fullDescriptionKey,
  detailsKey,
  iconKey,
  authorKey,
  publishDateKey,
  viewsCountKey,
}) => {
  if (!resource) return null; // No renderizar si no hay recurso seleccionado

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{resource[titleKey]}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2">
            {resource[categoryKey] && (
              <Badge variant="secondary">
                {resource[categoryKey].charAt(0).toUpperCase() +
                  resource[categoryKey].slice(1).replace("-", " ")}
              </Badge>
            )}
            {resource[typeKey] && (
              <Badge variant="outline">
                {resource[typeKey].charAt(0).toUpperCase() +
                  resource[typeKey].slice(1)}
              </Badge>
            )}
            {resource[iconKey] && (
              <IconRenderer
                iconName={resource[iconKey]}
                className="h-5 w-5 text-muted-foreground"
              />
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {resource[fullDescriptionKey] && (
            <>
              <h3 className="text-lg font-semibold mb-2">
                Descripción Completa
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {resource[fullDescriptionKey]}
              </p>
            </>
          )}

          {resource[detailsKey] && resource[detailsKey].length > 0 && (
            <>
              <Separator className="my-4" />
              <h3 className="text-lg font-semibold mb-2">
                Detalles Adicionales
              </h3>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {resource[detailsKey].map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </>
          )}

          {/* Información de Autor y Fecha de Publicación para blogs */}
          {(resource[authorKey] || resource[publishDateKey]) && (
            <>
              <Separator className="my-4" />
              <div className="text-sm text-gray-500">
                {resource[authorKey] && <p>Autor: {resource[authorKey]}</p>}
                {resource[publishDateKey] && (
                  <p>
                    Publicado el:{" "}
                    {format(
                      new Date(resource[publishDateKey]),
                      "dd MMMM yyyy",
                      { locale: es }
                    )}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Contador de Vistas en el modal (opcional) */}
          {viewsCountKey && resource[viewsCountKey] !== undefined && (
            <div className="mt-4 flex items-center text-sm text-gray-500">
              {/* Puedes usar solo el icono relleno aquí ya que es solo display */}
              <IoHeartSharp className="h-4 w-4 text-red-500 mr-1" />
              <span>{resource[viewsCountKey]} Me gusta</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceModal;
