// src/components/molecules/MobileMenuSheet.jsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * Molécula: Implementa el menú de hamburguesa y el Sheet para la navegación móvil.
 * @param {Array<Object>} links - Un array de objetos { href: string, label: string }.
 */
const MobileMenuSheet = ({ links }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
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
            {links.map((link) => (
              <Button
                key={link.href}
                asChild
                variant="ghost"
                className="text-gray-700 hover:text-blue-600 font-semibold text-lg"
                onClick={handleLinkClick}
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileMenuSheet;
