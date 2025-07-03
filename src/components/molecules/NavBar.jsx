// src/components/Navbar.jsx
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useAuthRedirect from "@/hooks/useAuthRedirect"; // Importa tu custom hook

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const redirectToAuthOrDashboard = useAuthRedirect(); // Inicializa tu hook

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-6 bg-white bg-opacity-80 backdrop-blur-sm shadow-sm">
      {/* Logo (esquina superior izquierda) */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          asChild
          variant="link" // Puedes elegir una variante que se parezca más a un enlace de texto/logo
          className="p-0 h-auto"
          onClick={redirectToAuthOrDashboard}
        >
          <div className="flex items-center space-x-2 cursor-pointer">
            <Image
              src="/globe.svg"
              alt="Logo de la Empresa"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-xl font-bold text-gray-800">AyF</span>
          </div>
        </Button>
      </motion.div>

      {/* Enlaces de Navegación para Escritorio (visible en pantallas medianas y grandes) */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex items-center space-x-4" // 'hidden' por defecto, 'flex' en md y superior
      >
        <Button
          asChild
          variant="ghost"
          className="text-gray-700 hover:text-blue-600 font-semibold text-base"
        >
          <Link href="#servicios-juridicos">Jurídico</Link>
        </Button>
        <Separator orientation="vertical" className="h-6 bg-gray-300" />
        <Button
          asChild
          variant="ghost"
          className="text-gray-700 hover:text-blue-600 font-semibold text-base"
        >
          <Link href="#servicios-contables">Contable</Link>
        </Button>
        <Separator orientation="vertical" className="h-6 bg-gray-300" />
        <Button
          asChild
          variant="ghost"
          className="text-gray-700 hover:text-blue-600 font-semibold text-base"
        >
          <Link href="#blog">Blog</Link>
        </Button>
        <Separator orientation="vertical" className="h-6 bg-gray-300" />
        <Button
          asChild
          variant="ghost"
          className="text-gray-700 hover:text-blue-600 font-semibold text-base"
        >
          <Link href="#contacto">Contacto</Link>
        </Button>
      </motion.div>

      {/* Menú de Hamburguesa para Móvil (visible en pantallas pequeñas) */}
      <div className="md:hidden">
        {" "}
        {/* 'hidden' en md y superior, visible por defecto */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-700">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Navegación</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-6">
              <Button
                asChild
                variant="ghost"
                className="text-gray-700 hover:text-blue-600 font-semibold text-lg"
                onClick={handleLinkClick}
              >
                <Link href="#servicios-juridicos">Jurídico</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-gray-700 hover:text-blue-600 font-semibold text-lg"
                onClick={handleLinkClick}
              >
                <Link href="#servicios-contables">Contable</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-gray-700 hover:text-blue-600 font-semibold text-lg"
                onClick={handleLinkClick}
              >
                <Link href="#blog">Blog</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-gray-700 hover:text-blue-600 font-semibold text-lg"
                onClick={handleLinkClick}
              >
                <Link href="#contacto">Contacto</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
