"use client";
import React from "react";
import { motion } from "framer-motion";
import PersonAvatar from "@/components/atoms/PersonAvatar"; // Importa el átomo

const PersonOnChargeCard = ({ persona, animationDelay = 0.2 }) => {
  return (
    <motion.div
      className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg mb-10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: animationDelay }}
    >
      <PersonAvatar
        imageUrl={persona.imagenUrl}
        altText={persona.nombre}
        description={persona.descripcion}
      />
    </motion.div>
  );
};

export default PersonOnChargeCard;
