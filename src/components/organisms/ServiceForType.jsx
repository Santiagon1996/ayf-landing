// src/components/organisms/ServiceForType.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useServices } from "@/hooks/useService"; // Asegúrate de que esta ruta sea correcta
import ResourceCard from "@/components/molecules/ResourceCard"; // ¡Usamos tu ResourceCard existente!
import ResourceModal from "@/components/molecules/ResourceModal"; // Tu modal existente
import { motion } from "framer-motion";
import Image from "next/image";
import { Separator } from "@/components/ui/separator"; // Componente de Shadcn
import { Skeleton } from "@/components/ui/skeleton"; // Componente de Shadcn
import Swal from "sweetalert2"; // Para alertas de errores

// --- Datos de la persona a cargo ---
const personasACargo = {
  juridico: {
    nombre: "Lic. Ana García",
    imagenUrl: "/picturePN1.jpg", // Asegúrate de que esta ruta exista en tu carpeta `public`
    descripcion:
      "Abogada especialista en derecho corporativo y fiscal con 15 años de trayectoria en AYF Asociados, enfocada en brindar soluciones innovadoras y estratégicas.",
  },
  contable: {
    nombre: "Contador Juan Pérez",
    imagenUrl: "/picturePN2.jpg", // Asegúrate de que esta ruta exista en tu carpeta `public`
    descripcion:
      "Experto en contabilidad financiera, auditoría y planificación fiscal. Liderando el área contable en AYF Asociados con un enfoque práctico y orientado a resultados.",
  },
};

// --- Framer Motion Variants ---
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Retraso entre las animaciones de cada tarjeta
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Organismo: Muestra servicios por tipo (jurídico o contable) junto con la persona a cargo.
 * Utiliza el hook `useServices` y el componente `ResourceCard`.
 * @param {string} type - El tipo de servicio a mostrar ('juridico' o 'contable').
 */
const ServiceForType = ({ type }) => {
  const { data: servicios, loading, error, fetchData } = useServices();

  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const personaACargo = personasACargo[type];

  // Carga los servicios cuando el componente se monta o cuando el 'type' cambia
  useEffect(() => {
    fetchData(type); // Pasamos el 'type' (ámbito) a fetchData
  }, [type, fetchData]);

  // Manejo de errores con SweetAlert (mantengo esto aquí por si quieres un manejo específico para este componente)
  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cargar los servicios",
        text: error.message || "Ocurrió un error inesperado.",
        confirmButtonText: "OK",
      });
      // Importante: Si useServices ya limpia el error después de mostrarlo, puedes omitir esta línea
      // Si no lo limpia, y quieres que no se muestre el Swal de nuevo hasta el próximo error, lo limpiarías aquí
    }
  }, [error]);

  const handleCardClick = useCallback((resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedResource(null);
  }, []);

  // --- UI del Estado de Carga (Skeletons) ---
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 bg-gray-50 rounded-lg shadow-sm mb-10">
          <Skeleton className="w-40 h-40 rounded-full" />
          <div className="flex-1 text-center md:text-left">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-5/6" />
          </div>
        </div>
        <Skeleton className="h-10 w-1/2 mx-auto my-8" />{" "}
        {/* Título de la sección */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map(
            (
              _,
              i // Muestra 3 tarjetas esqueleto
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
        <p>
          Error al cargar los servicios{" "}
          {type === "juridico" ? "jurídicos" : "contables"}.
        </p>
        <p>Por favor, inténtelo de nuevo más tarde. ({error.message})</p>
      </div>
    );
  }

  // --- UI de Persona a Cargo no Encontrada ---
  if (!personaACargo) {
    return (
      <div className="text-center py-16 text-gray-600 font-medium">
        <p>
          No se encontró información de la persona a cargo para el ámbito {type}
          .
        </p>
      </div>
    );
  }

  return (
    <motion.section
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
    >
      {/* Sección de la Persona a Cargo */}
      <motion.div
        className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg mb-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <Image
          src={personaACargo.imagenUrl}
          alt={personaACargo.nombre}
          width={150}
          height={150}
          className="rounded-full object-cover border-4 border-white shadow-md"
          priority
        />
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-3xl font-extrabold text-blue-800 mb-2">
            {personaACargo.nombre}
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto md:mx-0">
            {personaACargo.descripcion}
          </p>
        </div>
      </motion.div>

      <Separator className="my-10 bg-gray-300" />

      {/* Título de la Sección de Servicios */}
      <motion.h2
        className="text-4xl font-extrabold text-center text-blue-700 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        Nuestros Servicios{" "}
        <span className="text-indigo-600">
          {type === "juridico" ? "Jurídicos" : "Contables"}
        </span>
      </motion.h2>

      {/* Cuadrícula de Servicios */}
      {servicios && servicios.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={cardContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {servicios.map((servicio) => (
            <motion.div key={servicio.id} variants={cardItemVariants}>
              <ResourceCard
                resource={servicio}
                titleKey="name" // El título del servicio es 'name'
                categoryKey="category"
                typeKey="type"
                descriptionKey="shortDescription" // La descripción corta es 'shortDescription'
                iconKey="iconUrl" // O la clave para el icono del servicio
                onClick={handleCardClick}
                // No pasamos authorKey, publishDateKey, viewsCountKey, ni onLikeToggle
                // porque no son relevantes para los servicios según tu JSON actual
                // Si en el futuro los servicios los tienen, solo tendrías que pasar las props
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16 text-gray-600 text-lg">
          No hay servicios disponibles para este ámbito en este momento.
        </div>
      )}

      {/* Modal de Recursos */}
      <ResourceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        resource={selectedResource}
        titleKey="name"
        categoryKey="category"
        typeKey="type"
        fullDescriptionKey="fullDescription"
        detailsKey="details"
        iconKey="iconUrl"
        // Asegúrate de que ResourceModal maneje null para estas props si no siempre están presentes
        authorKey={null}
        publishDateKey={null}
        viewsCountKey={null}
      />
    </motion.section>
  );
};

export default ServiceForType;
