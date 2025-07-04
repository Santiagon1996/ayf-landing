// src/components/atoms/MainHeading.jsx
import React from "react";
import { motion } from "framer-motion";

const MainHeading = ({
  textoPrincipal,
  textoSecundario,
  colorDestacado = "text-blue-600",
  animationDelay = 0,
}) => {
  const variantesTitulo = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, delay: animationDelay },
    },
  };

  return (
    <motion.h1
      variants={variantesTitulo}
      initial="hidden"
      animate="visible"
      className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-4"
    >
      <span className={`block ${colorDestacado}`}>{textoPrincipal}</span>
      {textoSecundario && <span className="block mt-2">{textoSecundario}</span>}
    </motion.h1>
  );
};

export default MainHeading;
