"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useServices } from "@/hooks/useService";
import ResourceCard from "@/components/molecules/ResourceCard"; // Molécula existente
import ResourceModal from "@/components/molecules/ResourceModal"; // Molécula existente
import PersonOnChargeCard from "@/components/molecules/PersonOnChargeCard"; // Nueva molécula
import SectionTitle from "@/components/molecules/SectionTitle"; // Nueva molécula
import { Separator } from "@/components/ui/separator"; // Átomo de Shadcn
import { Skeleton } from "@/components/ui/skeleton"; // Átomo de Shadcn
import Swal from "sweetalert2";
import { motion } from "framer-motion";

// --- Datos de la persona a cargo (mantener aquí ya que son específicos de este organismo) ---
const personasACargo = {
  juridico: {
    nombre: "Sofia",
    imagenUrl: "/picturePN2.jpg",
    descripcion:
      "Soy Sofía, abogada especializada en derecho corporativo y asesoría legal para empresas.Con una sólida formación jurídica y años de experiencia, mi trabajo se centra en ofrecer soluciones legales claras y efectivas, siempre adaptadas a las necesidades específicas de cada cliente. Mi objetivo es proteger los intereses de las empresas y brindarles un marco legal seguro para su desarrollo.Me dedico a crear estrategias legales personalizadas que resuelvan problemas de manera eficiente, permitiendo a mis clientes concentrarse en lo que mejor saben hacer: crecer y prosperar.",
  },
  contable: {
    nombre: "Valeria",
    imagenUrl: "/picturePN1.jpg",
    descripcion: `Soy Valeria, contadora especializada en asesoramiento financiero y contable para empresas y emprendedores.
        Con años de experiencia en el mundo corporativo, mi enfoque se centra en optimizar procesos, garantizar la transparencia financiera y brindar soluciones que se adapten a las necesidades particulares de cada cliente. 
        Mi objetivo es acompañar en la toma de decisiones estratégicas, siempre con un enfoque integral que permita el desarrollo y crecimiento de su negocio.`,
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
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

/**
 * Organismo: Muestra servicios por tipo (jurídico o contable) junto con la persona a cargo.
 * Utiliza el hook `useServices` y componentes de nivel inferior (átomos y moléculas).
 * @param {string} type - El tipo de servicio a mostrar ('juridico' o 'contable').
 */
const SeccionServiciosPorTipo = ({ type }) => {
  const { data: servicios, loading, error, fetchData } = useServices();

  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const personaACargo = personasACargo[type];

  useEffect(() => {
    fetchData(type);
  }, [type, fetchData]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cargar los servicios",
        text: error.message || "Ocurrió un error inesperado.",
        confirmButtonText: "OK",
      });
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
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-60 w-full" />
          ))}
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
      {/* Molécula: PersonOnChargeCard */}
      <PersonOnChargeCard persona={personaACargo} animationDelay={0.2} />

      <Separator className="my-10 bg-gray-300" />

      {/* Molécula: SectionTitle */}
      <SectionTitle
        tituloFijo="Nuestros Servicios"
        tituloDinamico={type === "juridico" ? "Jurídicos" : "Contables"}
        animationDelay={0.4}
      />

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
                titleKey="name"
                categoryKey="category"
                typeKey="type"
                descriptionKey="shortDescription"
                iconKey="iconUrl"
                onClick={handleCardClick}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-16 text-gray-600 text-lg">
          No hay servicios disponibles para este ámbito en este momento.
        </div>
      )}

      {/* Molécula: ResourceModal (ya existente) */}
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
        authorKey={null}
        publishDateKey={null}
        viewsCountKey={null}
      />
    </motion.section>
  );
};

export default SeccionServiciosPorTipo;
