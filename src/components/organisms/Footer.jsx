"use client";
import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Obtiene el año actual dinámicamente

  // Definimos el color azul marino en una variable, como lo solicitaste
  const textColor = "text-white";
  const backgroundColor = "bg-blue-900"; // Azul 900 para el fondo

  return (
    <footer className={`${backgroundColor} ${textColor} p-6 md:p-8`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
        {/* Sección de Contacto */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-lg font-semibold mb-2">Contacto</h3>
          <p className="text-sm">
            <a
              href="mailto:contacto@ayfasociados.com"
              className="hover:underline"
            >
              contacto@ayfasociados.com
            </a>
          </p>
          <p className="text-sm mt-1">Rosario, Argentina</p>
        </div>

        {/* Sección de Copyright */}
        <div className="text-center md:text-right">
          <p className="text-sm">
            &copy; {currentYear} AYF Asociados. Todos los derechos reservados.
          </p>
          <p className="text-xs mt-1 opacity-75">
            Estudio Jurídico Contable. Asesoramiento integral.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
