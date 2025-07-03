// src/components/organisms/ResourceCardDisplay.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import ResourceCard from "@/components/molecules/ResourceCard";
import ResourceModal from "@/components/molecules/ResourceModal";

/**
 * Organismo: Cuadrícula de visualización de recursos (servicios o blogs).
 * Encapsula la lógica de fetching, estado del modal y renderizado de las tarjetas.
 * @param {function} useResourceHook - El custom hook para obtener los datos (ej. useBlog, useService).
 * @param {string} titleKey - Clave para el título del recurso.
 * @param {string} categoryKey - Clave para la categoría del recurso.
 * @param {string} typeKey - Clave para el tipo del recurso.
 * @param {string} descriptionKey - Clave para la descripción breve.
 * @param {string} fullDescriptionKey - Clave para la descripción completa.
 * @param {string} detailsKey - Clave para el array de detalles.
 * @param {string} iconKey - Clave para el nombre del icono.
 * @param {string} authorKey - Clave para el autor (opcional, para blogs).
 * @param {string} publishDateKey - Clave para la fecha de publicación (opcional, para blogs).
 * @param {string} viewsCountKey - Clave para el contador de vistas (opcional, para blogs).
 */
const ResourceCardDisplay = ({
  useResourceHook,
  titleKey,
  categoryKey,
  typeKey,
  descriptionKey,
  fullDescriptionKey,
  detailsKey,
  iconKey,
  authorKey = null,
  publishDateKey = null,
  viewsCountKey = null,
}) => {
  const {
    data: resources,
    loading,
    error,
    fetchData,
    updateResource,
  } = useResourceHook(); // Asumo que useBlog/useService pueden tener updateResource

  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData(); // Carga los datos cuando el componente se monta
  }, [fetchData]);

  const handleCardClick = (resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResource(null);
  };

  // Función para manejar el toggle de "me gusta" y potencialmente llamar a la API
  const handleLikeToggle = useCallback(
    async (resourceId, isLikedNow) => {
      if (updateResource) {
        try {
          // Asumo que updateResource puede manejar la actualización de likes
          // Tu API/backend debería manejar el incremento/decremento atómicamente
          await updateResource(resourceId, {
            [viewsCountKey]: isLikedNow ? "increment" : "decrement", // Envía una señal para que el backend maneje esto
          });
          // Una vez actualizado en el backend, recarga los datos para reflejar el cambio
          fetchData();
        } catch (err) {
          console.error("Error al actualizar los likes:", err);
          // Opcional: mostrar un toast de error al usuario
        }
      }
    },
    [updateResource, fetchData, viewsCountKey]
  );

  if (loading) {
    return <div className="text-center py-8">Cargando recursos...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error al cargar los recursos: {error.message}
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay recursos disponibles.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            titleKey={titleKey}
            categoryKey={categoryKey}
            typeKey={typeKey}
            descriptionKey={descriptionKey}
            iconKey={iconKey}
            authorKey={authorKey}
            publishDateKey={publishDateKey}
            viewsCountKey={viewsCountKey}
            onClick={handleCardClick}
            onLikeToggle={handleLikeToggle} // Pasa la función de manejo de likes
          />
        ))}
      </div>

      <ResourceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        resource={selectedResource}
        titleKey={titleKey}
        categoryKey={categoryKey}
        typeKey={typeKey}
        fullDescriptionKey={fullDescriptionKey}
        detailsKey={detailsKey}
        iconKey={iconKey}
        authorKey={authorKey}
        publishDateKey={publishDateKey}
        viewsCountKey={viewsCountKey}
      />
    </>
  );
};

export default ResourceCardDisplay;
