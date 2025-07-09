"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

const images = ["/about1.jpg", "/about2.jpg", "/about3.jpg"];

const AboutUs = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="container mx-auto py-12 px-4 md:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Sección del Banner de Imágenes */}
        <Card className="relative w-full h-96 overflow-hidden rounded-lg shadow-xl">
          <AnimatePresence initial={false} mode="wait">
            <motion.img
              key={currentImageIndex}
              src={images[currentImageIndex]}
              alt={`About Us Banner ${currentImageIndex + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </AnimatePresence>
        </Card>
        {/* Sección de Texto */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50">
            ¿Quienes somos, y por que elegirnos?
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            Somos Vale y Sofi. Después de años de formación y experiencia
            profesional, decidimos unir nuestras especialidades para crear un
            estudio jurídico-contable con mirada integral, práctica y cercana.
            Entre café, balances y contratos, surgió una sociedad profesional
            que no se improvisa: la que se construye con respeto, confianza y
            una visión compartida. Así nació nuestro estudio. Porque creemos que
            el asesoramiento debe ser claro, completo y, sobre todo, pensado
            desde el cliente. Porque cada solución tiene que tener el tamaño
            justo de cada necesidad.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
