import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import Navbar from "../molecules/NavBar";

const Welcome = () => {
  return (
    <div className="relative h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      <Navbar />

      {/* Contenido Principal: Frase de Bienvenida e Imagen */}
      {/* Añadí un ID 'inicio' al div principal del contenido para el link del logo */}
      <div
        id="inicio"
        className="flex flex-col md:flex-row items-center justify-center h-full px-6 py-20"
      >
        {/* Frase de Bienvenida (lateral izquierda) */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="md:w-1/2 text-center md:text-left p-4 md:p-8"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
            <span className="block text-blue-600">Bienvenido/a</span>
            <span className="block mt-2">AyF Asociados</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-md mx-auto md:mx-0">
            Simplificamos tus gestiones legales y financieras con experiencia y
            confianza.
          </p>
        </motion.div>

        {/* Imagen (lado derecho) */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="md:w-1/2 flex justify-center p-4 md:p-8 mt-8 md:mt-0"
        >
          <Image
            src="/welcomeImg.jpg"
            alt="Ilustración de bienvenida"
            width={600}
            height={400}
            className="rounded-lg shadow-xl max-w-full h-auto"
            priority
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
