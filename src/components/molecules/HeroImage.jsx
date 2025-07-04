// src/components/molecules/HeroImage.jsx
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const HeroImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  animationDelay = 0.7,
}) => {
  const variantesImagen = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, delay: animationDelay },
    },
  };

  return (
    <motion.div
      variants={variantesImagen}
      initial="hidden"
      animate="visible"
      className="md:w-1/2 flex justify-center p-4 md:p-8 mt-8 md:mt-0"
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-lg shadow-xl max-w-full h-auto"
        priority={priority}
      />
    </motion.div>
  );
};

export default HeroImage;
