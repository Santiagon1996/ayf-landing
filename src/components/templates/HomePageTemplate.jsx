"use client";

import React from "react";
import { useBlog } from "@/hooks/useBlog";
import ServiceForType from "../organisms/ServiceForType.jsx";
import ResourceCardDisplay from "@/components/organisms/ResourceCardDisplay";
import { Separator } from "@/components/ui/separator";
import Welcome from "./Welcome.jsx";
import Contact from "@/components/organisms/Contact.jsx";

/**
 * Plantilla: Define la estructura y el contenido principal de la página de inicio.
 * Recibe y pasa los datos de los hooks a los organismos correspondientes.
 */
const HomePageTemplate = () => {
  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        <Welcome />
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Sección de Servicios Jurídicos */}
        <div id="servicios-juridicos" className="pt-20 -mt-20">
          <h1 className="text-4xl font-bold text-center mb-10 text-primary">
            Nuestros Servicios Jurídicos
          </h1>
          <ServiceForType type="juridico" />
        </div>
        <Separator className="my-16" /> {/* Sección de Servicios Contables */}
        <div id="servicios-contables" className="pt-20 -mt-20">
          <h1 className="text-4xl font-bold text-center mb-10 text-primary">
            Nuestros Servicios Contables
          </h1>
          <ServiceForType type="contable" />
        </div>
        <Separator className="my-16" />
        <div id="blog" className="pt-20 -mt-20">
          {" "}
          {/* pt-20 y -mt-20 para compensar el fixed header */}
          <h1 className="text-4xl font-bold text-center mb-10 text-primary">
            Nuestro Blog
          </h1>
          <ResourceCardDisplay
            useResourceHook={useBlog}
            titleKey="title"
            categoryKey="category"
            typeKey={null} // Tu blog no tiene un 'type' como servicio, si lo agregas, úsalo aquí
            descriptionKey="description"
            fullDescriptionKey="content"
            detailsKey={null}
            iconKey="iconUrl"
            authorKey="author"
            publishDateKey="publishedAt"
            viewsCountKey="viewsCount"
          />
        </div>
      </div>
      {/* Sección de Contacto */}
      <div id="contacto" className="pt-20 -mt-20">
        {" "}
        {/* pt-20 y -mt-20 para compensar el fixed header */}
        <Contact />
      </div>{" "}
    </>
  );
};

export default HomePageTemplate;
