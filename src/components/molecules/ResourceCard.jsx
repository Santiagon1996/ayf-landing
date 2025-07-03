// src/components/molecules/ResourceCard.jsx
"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import IconRenderer from "@/components/atoms/IconRenderer"; // Importa el átomo
import LikeButton from "@/components/atoms/LikeButton"; // Importa el átomo
import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Molécula: Tarjeta de visualización de un recurso (servicio o blog).
 * @param {object} resource - El objeto de datos del recurso (servicio o blog).
 * @param {string} titleKey - Clave para el título.
 * @param {string} categoryKey - Clave para la categoría.
 * @param {string} typeKey - Clave para el tipo.
 * @param {string} descriptionKey - Clave para la descripción breve.
 * @param {string} iconKey - Clave para el nombre del icono.
 * @param {string} authorKey - Clave para el autor (opcional, para blogs).
 * @param {string} publishDateKey - Clave para la fecha de publicación (opcional, para blogs).
 * @param {string} viewsCountKey - Clave para el contador de vistas (opcional, para blogs).
 * @param {function} onClick - Función a ejecutar al hacer clic en la tarjeta.
 * @param {function} onLikeToggle - Función para manejar el "me gusta" (pasada al LikeButton).
 */
const ResourceCard = ({
  resource,
  titleKey,
  categoryKey,
  typeKey,
  descriptionKey,
  iconKey,
  authorKey,
  publishDateKey,
  viewsCountKey,
  onClick,
  onLikeToggle,
}) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col"
      onClick={() => onClick(resource)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-x-4 pb-2">
        <CardTitle className="text-xl font-bold">
          {resource[titleKey]}
        </CardTitle>
        {resource[iconKey] && (
          <IconRenderer
            iconName={resource[iconKey]}
            className="h-8 w-8 text-primary"
          />
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        {resource[categoryKey] && (
          <Badge variant="secondary" className="mb-2 mr-2">
            {resource[categoryKey].charAt(0).toUpperCase() +
              resource[categoryKey].slice(1).replace("-", " ")}
          </Badge>
        )}
        {resource[typeKey] && (
          <Badge variant="outline" className="mb-2">
            {resource[typeKey].charAt(0).toUpperCase() +
              resource[typeKey].slice(1)}
          </Badge>
        )}
        <CardDescription className="mt-2 text-gray-600">
          {resource[descriptionKey]}
        </CardDescription>
        {/* Información adicional para blogs en la tarjeta */}
        {authorKey && resource[authorKey] && (
          <p className="text-xs text-gray-500 mt-2">
            Por: {resource[authorKey]}
          </p>
        )}
        {publishDateKey && resource[publishDateKey] && (
          <p className="text-xs text-gray-500">
            Fecha:{" "}
            {format(new Date(resource[publishDateKey]), "dd MMMM yyyy", {
              locale: es,
            })}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center">
        <span className="text-sm text-gray-500">Más info...</span>
        {viewsCountKey && resource[viewsCountKey] !== undefined && (
          <LikeButton
            resourceId={resource._id}
            initialViewsCount={resource[viewsCountKey]}
            onLikeToggle={onLikeToggle}
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default ResourceCard;
