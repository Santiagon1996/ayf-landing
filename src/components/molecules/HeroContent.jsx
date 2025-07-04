"use client";

import React from "react";
import { motion } from "framer-motion";
import MainHeadingComponent from "@/components/atoms/MainHeading"; // Renombrado en la importación
import DescriptiveTextComponent from "@/components/atoms/DescriptiveText"; // Renombrado en la importación

const HeroContent = ({
  mainTitleText, // Nuevo nombre para la prop del texto principal
  secondaryTitleText, // Nuevo nombre para la prop del texto secundario
  descriptiveBodyText, // Nuevo nombre para la prop del texto descriptivo
  animationDelay = 0.5,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: animationDelay }}
      className="md:w-1/2 text-center md:text-left p-4 md:p-8"
    >
      <MainHeadingComponent // Usamos el componente renombrado
        textoPrincipal={mainTitleText} // Pasamos la nueva prop de texto
        textoSecundario={secondaryTitleText} // Pasamos la nueva prop de texto secundario
        animationDelay={0}
      />
      <DescriptiveTextComponent // Usamos el componente renombrado
        texto={descriptiveBodyText} // Pasamos la nueva prop de texto descriptivo
        animationDelay={0.2}
      />
    </motion.div>
  );
};

export default HeroContent;
