"use client";
import React from "react";
import Navbar from "@/components/organisms/NavBar";
import HeroContent from "@/components/molecules/HeroContent";
import HeroImage from "@/components/molecules/HeroImage";

const Welcome = () => {
  return (
    <div className="relative h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      <Navbar />

      {/* Contenido Principal de la Sección de Bienvenida */}
      <div
        id="inicio" // Mantén el ID para navegación si es necesario
        className="flex flex-col md:flex-row items-center justify-center h-full px-6 py-20"
      >
        {/* Molécula: HeroContent */}
        <HeroContent
          mainTitleText="Bienvenido/a"
          secondaryTitleText="AyF Asociados"
          descriptiveBodyText="Simplificamos tus gestiones legales y financieras con experiencia y confianza."
          animationDelay={0.5}
        />

        {/* Molécula: HeroImage */}
        <HeroImage
          src="/welcomeImg.jpg"
          alt="Ilustración de bienvenida"
          width={600}
          height={400}
          priority // Carga prioritaria para la imagen principal
          animationDelay={0.7} // Retraso para que la imagen aparezca ligeramente después del texto
        />
      </div>
    </div>
  );
};

export default Welcome;
