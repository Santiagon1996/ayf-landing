import React from "react";
import ServiceForType from "../organisms/ServiceForType.jsx";
import DisplayBlogs from "@/components/organisms/DisplayBlogs.jsx";
import { Separator } from "@/components/ui/separator";
import Welcome from "../organisms/Welcome.jsx";
import Contact from "@/components/organisms/Contact.jsx";
import AboutUs from "@/components/organisms/AboutUs.jsx";
import Footer from "../organisms/Footer.jsx";

/**
 * Plantilla: Define la estructura y el contenido principal de la página de inicio.
 * Orquesta la disposición de los organismos en la página.
 */
const HomePageTemplate = () => {
  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        <Welcome />
      </div>

      {/* Sección de Sobre nosotras */}
      <div id="sobre-nosotras" className="pt-20 -mt-20">
        <AboutUs />
      </div>
      <Separator className="my-16" />

      <div className="container mx-auto px-4 py-8">
        {/* Sección de Servicios Jurídicos */}
        <div id="servicios-juridicos" className="pt-20 -mt-20">
          <h1 className="text-4xl font-extrabold text-center mb-12 text-blue-950">
            Area Juridica
          </h1>
          <ServiceForType type="juridico" />
        </div>

        <Separator className="my-16" />

        {/* Sección de Servicios Contables */}
        <div id="servicios-contables" className="pt-20 -mt-20">
          <h1 className="text-4xl font-extrabold text-center mb-12 text-blue-950">
            Area Contable
          </h1>
          <ServiceForType type="contable" />
        </div>

        <Separator className="my-16" />

        {/* Sección de Blog*/}
        <div id="blog" className="pt-20 -mt-20">
          <h1 className="text-4xl font-extrabold text-center mb-12 text-blue-950">
            Nuestro Blog
          </h1>
          <DisplayBlogs />
        </div>
      </div>

      <Separator className="my-16" />

      {/* Sección de Contacto */}
      <div id="contacto" className="pt-20 -mt-20">
        <Contact />
      </div>
      <Footer />
    </>
  );
};

export default HomePageTemplate;
