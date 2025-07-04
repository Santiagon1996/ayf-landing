"use client";

import React from "react";
import LogoLink from "@/components/molecules/LogoLink";
import DesktopNavLinks from "@/components/molecules/DesktopNavLinks";
import MobileMenuSheet from "@/components/molecules/MobileMenuSheet";

/**
 * Organismo: Barra de navegación principal de la aplicación.
 * Compone el logo, los enlaces de navegación de escritorio y el menú móvil.
 */
const Navbar = () => {
  // Define los enlaces de navegación en un solo lugar
  const navLinks = [
    { href: "#servicios-juridicos", label: "Jurídico" },
    { href: "#servicios-contables", label: "Contable" },
    { href: "#blog", label: "Blog" },
    { href: "#contacto", label: "Contacto" },
    { href: "#sobre-nosotras", label: "Sobre Nosotras" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-1 bg-white bg-opacity-80 backdrop-blur-sm shadow-sm">
      <LogoLink />
      <DesktopNavLinks links={navLinks} />
      <MobileMenuSheet links={navLinks} />
    </nav>
  );
};

export default Navbar;
