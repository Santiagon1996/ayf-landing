// src/components/organisms/DisplayBlogs.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useBlog } from "@/hooks/useBlog";
import BlogCard from "@/components/molecules/BlogCard";
import BlogModal from "@/components/molecules/BlogModal";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Swal from "sweetalert2"; // Para notificaciones de error

/**
 * Organismo: Muestra una cuadrícula de blogs.
 * Encapsula la lógica de fetching de blogs, estado del modal y renderizado de las tarjetas.
 */
const DisplayBlogs = () => {
  const { data: blogs, loading, error, fetchData } = useBlog(); // updateResource ya no es necesario

  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCardClick = (blog) => {
    setSelectedResource(blog);
    setIsModalOpen(true);
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-60 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // --- UI del Estado de Error ---
  if (error) {
    return (
      <div className="text-center py-16 text-red-600 font-semibold text-lg">
        <p>Error al cargar los blogs.</p>
        <p>
          Por favor, inténtelo de nuevo más tarde. (
          {error.message || "Error desconocido"})
        </p>
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
            <BlogCard blog={blog} onClick={handleCardClick} />
          </motion.div>
        ))}
      </motion.div>

      <BlogModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedResource(null);
        }}
        blog={selectedResource}
      />
    </>
  );
};

export default DisplayBlogs;
