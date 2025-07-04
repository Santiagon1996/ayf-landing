"use client";
import React from "react";
import { motion } from "framer-motion";

const SectionTitle = ({
  tituloFijo,
  tituloDinamico,
  colorFijo = "text-blue-700",
  colorDinamico = "text-indigo-600",
  animationDelay = 0,
}) => {
  return (
    <motion.h2
      className={`text-4xl font-extrabold text-center ${colorFijo} mb-12`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: animationDelay }}
    >
      {tituloFijo} <span className={colorDinamico}>{tituloDinamico}</span>
    </motion.h2>
  );
};

export default SectionTitle;
