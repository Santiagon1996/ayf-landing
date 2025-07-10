// src/components/molecules/BlogCard.jsx
"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
//import IconRenderer from "@/components/atoms/IconRenderer"; // Para renderizar el icono principal del blog
import { IoHeartOutline, IoHeartSharp } from "react-icons/io5"; // Iconos de corazón
//import { Separator } from "@/components/ui/separator";

/**
 * Molécula: Tarjeta de blog con diseño de "red social" (adaptada para likes visuales e iconos).
 * @param {object} blog - El objeto de datos del blog.
 * @param {function} onClick - Función para abrir el modal de detalles.
 */
const BlogCard = ({ blog, onClick }) => {
  // onLikeToggle ya no es necesario aquí
  // Estado local para el contador de "me gusta" puramente visual
  const [currentViews, setCurrentViews] = useState(blog.viewsCount || 0);
  const [isLiked, setIsLiked] = useState(false); // Estado para si el usuario actual le ha dado "me gusta"

  const handleLikeClick = (e) => {
    e.stopPropagation(); // Evita que se dispare el onClick de la tarjeta al hacer clic en el corazón

    // Lógica para incrementar/decrementar visualmente
    if (isLiked) {
      setCurrentViews(Math.max(0, currentViews - 1));
    } else {
      setCurrentViews(currentViews + 1);
    }
    setIsLiked(!isLiked); // Cambia el estado de "me gusta"
  };

  const formattedDate = blog.publishedAt
    ? format(new Date(blog.publishedAt), "dd 'de' MMMM 'de' yyyy", {
        locale: es,
      })
    : "Fecha desconocida";

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
        {" "}
        {/* Ajuste items-start */}
        <div className="flex-grow">
          <div className="flex items-center mb-2 text-sm text-gray-600">
            <Badge variant="secondary" className="mr-2">
              {blog.category
                ? blog.category.charAt(0).toUpperCase() +
                  blog.category.slice(1).replace("-", " ")
                : "General"}
            </Badge>
            <span className="text-gray-500">• {formattedDate}</span>
          </div>
          <CardTitle className="text-2xl font-bold leading-tight mb-2">
            {blog.title}
          </CardTitle>
        </div>
        {/* {blog.iconUrl && ( // Cambiamos de imageUrl a iconName
          <IconRenderer
            iconName={blog.iconUrl} // Usa la prop iconName del blog
            className="h-10 w-10 text-primary flex-shrink-0 ml-4" // Ajusta tamaño y espaciado
          />
        )} */}
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-grow">
        {/* Añadido flex-grow */}
        <p className="text-sm text-gray-700 leading-relaxed">
          {blog.description}
        </p>
        {blog.author && (
          <p className="text-sm text-gray-500 italic mt-2">
            Por: {blog.author}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLikeClick}
            className="p-0 h-auto"
          >
            {isLiked ? (
              <IoHeartSharp className="h-6 w-6 text-red-500 transition-transform transform hover:scale-110" />
            ) : (
              <IoHeartOutline className="h-6 w-6 text-gray-500 hover:text-red-500 transition-transform transform hover:scale-110" />
            )}
          </Button>
          <span className="text-sm text-gray-600">{currentViews} Me gusta</span>
        </div>
        <Button
          variant="link"
          onClick={() => onClick(blog)}
          className="text-blue-600 hover:underline p-0 h-auto"
        >
          Leer más →
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BlogCard;
