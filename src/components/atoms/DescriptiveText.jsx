// src/components/atoms/DescriptiveText.jsx
import React from "react";
import { motion } from "framer-motion";

const DescriptiveText = ({ texto, animationDelay = 0 }) => {
  const variantesTexto = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: animationDelay },
    },
  };

  return (
    <motion.p
      variants={variantesTexto}
      initial="hidden"
      animate="visible"
      className="text-lg sm:text-xl text-gray-700 max-w-md mx-auto md:mx-0"
    >
      {texto}
    </motion.p>
  );
};

export default DescriptiveText;
