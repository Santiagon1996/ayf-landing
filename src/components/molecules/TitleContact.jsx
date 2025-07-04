// src/components/molecules/TituloHero.jsx
import React from "react";
import { motion } from "framer-motion";

const TituloHero = ({
  titulo,
  palabraDestacada,
  colorDestacado = "text-blue-600",
  retrasoAnimacion = 0, // Delay en segundos para la aparición del título
}) => {
  // Divide el título para poder aplicar estilos solo a la palabra destacada
  const partes = titulo.split(new RegExp(`(${palabraDestacada})`, "gi"));

  const variantesTitulo = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: retrasoAnimacion,
      },
    },
  };

  return (
    <motion.h2
      variants={variantesTitulo}
      initial="hidden"
      animate="visible"
      className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center text-gray-900 mb-12 max-w-2xl leading-tight"
    >
      {partes.map((parte, index) =>
        parte.toLowerCase() === palabraDestacada.toLowerCase() ? (
          <span key={index} className={colorDestacado}>
            {parte}
          </span>
        ) : (
          parte
        )
      )}
    </motion.h2>
  );
};

export default TituloHero;
