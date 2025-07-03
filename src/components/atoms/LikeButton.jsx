// src/components/atoms/LikeButton.jsx
"use client";

import React, { useState, useCallback } from "react";
import { IoHeartOutline, IoHeartSharp } from "react-icons/io5"; // Iconos de corazón

/**
 * Átomo: Botón de corazón con contador de likes.
 * @param {string} resourceId - ID único del recurso (blog, servicio, etc.).
 * @param {number} initialViewsCount - Número inicial de vistas/likes.
 * @param {function} onLikeToggle - Función callback para notificar al componente superior sobre el cambio (ej. para actualizar la DB).
 */
const LikeButton = ({ resourceId, initialViewsCount, onLikeToggle }) => {
  const [likes, setLikes] = useState(initialViewsCount || 0);
  // En un caso real, 'isLiked' se determinaría si el usuario actual ya le dio like.
  // Por ahora, lo inicializamos a false.
  const [isLiked, setIsLiked] = useState(false);

  const handleLikeClick = useCallback(
    (e) => {
      e.stopPropagation(); // Evita que el clic en el botón active el onClick de la tarjeta
      // Simulación: Inviertes el estado y ajustas los likes
      const newIsLiked = !isLiked;
      const newLikes = newIsLiked ? likes + 1 : likes - 1;

      setLikes(newLikes);
      setIsLiked(newIsLiked);

      // Llama a la función proporcionada por el padre para manejar la persistencia (API)
      if (onLikeToggle) {
        onLikeToggle(resourceId, newIsLiked); // Pasa el ID y el nuevo estado (liked/unliked)
      }
    },
    [resourceId, likes, isLiked, onLikeToggle]
  );

  return (
    <div className="flex items-center text-sm text-gray-500">
      <button
        onClick={handleLikeClick}
        className="flex items-center gap-1 p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-label={isLiked ? "Quitar me gusta" : "Me gusta"}
      >
        {isLiked ? (
          <IoHeartSharp className="h-4 w-4 text-red-500" />
        ) : (
          <IoHeartOutline className="h-4 w-4 text-gray-400" />
        )}
        <span>{likes}</span>
      </button>
    </div>
  );
};

export default LikeButton;
