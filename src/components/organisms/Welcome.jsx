"use client";
import React from "react";
import Navbar from "@/components/organisms/NavBar";
import HeroContent from "@/components/molecules/HeroContent";
import HeroImage from "@/components/molecules/HeroImage";

const Welcome = () => {
  return (
    <div className="relative min-h-screen md:h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      <Navbar />

      {/* Contenido Principal de la Sección de Bienvenida */}
      <div
        id="inicio"
        className="flex flex-col md:flex-row items-center justify-center h-full px-6 pt-[100px] sm:pt-[120px] md:pt-24 md:pb-8"
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
          priority
          animationDelay={0.7}
          className="mt-8 md:mt-0 max-w-full h-auto"
        />
      </div>
    </div>
  );
};

export default Welcome;
