"use client";
import React from "react";
import { Button } from "@/components/ui/button"; // Botón de Shadcn UI

const ButtonContact = ({ onClick, children, className = "" }) => {
  return (
    <Button
      onClick={onClick}
      className={`px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 ${className}`}
    >
      {children}
    </Button>
  );
};

export default ButtonContact;
