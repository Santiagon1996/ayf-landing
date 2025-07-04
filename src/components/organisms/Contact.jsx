// src/components/organisms/SeccionContacto.jsx
import React from "react";
import { motion } from "framer-motion";
import ButtonContact from "@/components/atoms/ButtonContact";
import TitleContact from "@/components/molecules/TitleContact";

const SeccionContacto = () => {
  const emailAddress = "contacto@ayfasociados.com";
  const subject = "Consulta desde el sitio web";

  const handleContactClick = () => {
    window.location.href = `mailto:${emailAddress}?subject=${encodeURIComponent(
      subject
    )}`;
  };

  // Variantes para el botón
  const variantesBoton = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 5.5, // Aparece después del título (ajustar si cambias el delay del título)
      },
    },
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-hidden">
      {/* Molécula: Título Hero */}
      <TitleContact
        titulo="¿Listo para despegar con nosotros?"
        palabraDestacada="despegar"
        retrasoAnimacion={4.5} // Retraso para que el título aparezca después del avión
      />

      {/* Átomo: Botón de Llamada a la Acción */}
      <motion.div variants={variantesBoton} initial="hidden" animate="visible">
        <ButtonContact onClick={handleContactClick}>Contáctanos</ButtonContact>
      </motion.div>
    </div>
  );
};

export default SeccionContacto;
