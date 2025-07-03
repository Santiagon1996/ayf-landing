import React from "react";
import { motion } from "framer-motion";
import { IoAirplane } from "react-icons/io5";
import { Button } from "@/components/ui/button";

const Contact = () => {
  const emailAddress = "contacto@ayfasociados.com";
  const subject = "Consulta desde el sitio web";

  const handleContactClick = () => {
    window.location.href = `mailto:${emailAddress}?subject=${encodeURIComponent(
      subject
    )}`;
  };

  // Variantes para el avión
  const planeVariants = {
    initial: { x: "-100vw", opacity: 0 },
    animate: {
      x: "110vw",
      opacity: 1,
      transition: {
        duration: 4.5,
        ease: "easeInOut",
      },
    },
  };

  // Variantes para el título
  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 4.5, // Aparece después de que el avión termina su animación
      },
    },
  };

  // Variantes para el botón
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 5.5, // Aparece después del título
      },
    },
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-hidden">
      {/* Avión */}
      <motion.div
        className="absolute top-1/2 transform -translate-y-1/2 text-blue-600"
        variants={planeVariants}
        initial="initial"
        animate="animate"
      >
        <IoAirplane className="w-10 h-10 sm:w-12 sm:h-12" />
      </motion.div>

      {/* Título */}
      <motion.h2
        variants={titleVariants}
        initial="hidden"
        animate="visible"
        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-gray-900 mb-12 max-w-2xl leading-tight"
      >
        ¿Listo para <span className="text-blue-600">despegar</span> con
        nosotros?
      </motion.h2>

      {/* Botón */}
      <motion.div variants={buttonVariants} initial="hidden" animate="visible">
        <Button
          onClick={handleContactClick}
          className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Contáctanos
        </Button>
      </motion.div>
    </div>
  );
};

export default Contact;
