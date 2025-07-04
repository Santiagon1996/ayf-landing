// src/components/organisms/DisplayBlogs.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useBlog } from "@/hooks/useBlog";
import ResourceCard from "@/components/molecules/ResourceCard";
import ResourceModal from "@/components/molecules/ResourceModal";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton"; // Importamos Skeleton directamente aquí

/**
 * Organismo: Muestra una cuadrícula de blogs.
 * Encapsula la lógica de fetching de blogs, estado del modal y renderizado de las tarjetas.
 */
const DisplayBlogs = () => {
  // Ya no recibe props de componentes de estado
  const { data: blogs, loading, error, fetchData, updateResource } = useBlog();

  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCardClick = (blog) => {
    setSelectedResource(blog);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResource(null);
  };

  const handleLikeToggle = useCallback(
    async (blogId, isLikedNow) => {
      if (updateResource) {
        try {
          await updateResource(blogId, {
            views: isLikedNow ? "increment" : "decrement",
          });
          fetchData();
        } catch (err) {
          console.error("Error al actualizar los likes del blog:", err);
        }
      }
    },
    [updateResource, fetchData]
  );

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // --- UI del Estado de Carga (Skeletons) ---
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {[...Array(2)].map(
            (
              _,
              i // Muestra 2 esqueletos para la cuadrícula de 2 columnas
            ) => (
              <Skeleton key={i} className="h-60 w-full" />
            )
          )}
        </div>
      </div>
    );
  }

  // --- UI del Estado de Error ---
  if (error) {
    return (
      <div className="text-center py-16 text-red-600 font-semibold text-lg">
        <p>Error al cargar los blogs.</p>
        <p>Por favor, inténtelo de nuevo más tarde. ({error.message})</p>
      </div>
    );
  }

  // --- UI del Estado Vacío ---
  if (!blogs || blogs.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        No hay blogs disponibles.
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 p-4"
        variants={cardContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {blogs.map((blog) => (
          <motion.div key={blog.id} variants={cardItemVariants}>
            <ResourceCard
              resource={blog}
              titleKey="title"
              categoryKey="category"
              typeKey="type"
              descriptionKey="shortDescription"
              iconKey="imageUrl"
              authorKey="author"
              publishDateKey="publishDate"
              viewsCountKey="views"
              onClick={() => handleCardClick(blog)}
              onLikeToggle={handleLikeToggle}
            />
          </motion.div>
        ))}
      </motion.div>

      <ResourceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        resource={selectedResource}
        titleKey="title"
        categoryKey="category"
        typeKey="type"
        fullDescriptionKey="fullDescription"
        detailsKey="details"
        iconKey="imageUrl"
        authorKey="author"
        publishDateKey="publishDate"
        viewsCountKey="views"
      />
    </>
  );
};

export default DisplayBlogs;
