// src/components/atoms/IconRenderer.jsx
"use client";

import React from "react";
import { ICON_OPTIONS } from "../icons/icons.js";
/**
 * Átomo: Componente para renderizar un icono basado en su nombre.
 * @param {string} iconName - El nombre amigable del icono (ej. "Empresarial", "Blog").
 * @param {string} className - Clases de estilo Tailwind CSS para aplicar al icono.
 */
const IconRenderer = ({ iconName, className }) => {
  const IconComponent = ICON_OPTIONS[iconName];
  if (!IconComponent) {
    // Puedes retornar un icono por defecto o null si el nombre no se encuentra
    console.warn(`Icono no encontrado para el nombre: ${iconName}`);
    return null;
  }
  return <IconComponent className={className} />;
};

export default IconRenderer;
