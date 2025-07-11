"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/**
 * Molécula: Contiene los enlaces de navegación visibles en escritorio.
 * @param {Array<Object>} links - Un array de objetos { href: string, label: string }.
 */
const DesktopNavLinks = ({ links }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="hidden md:flex items-center space-x-4" // 'hidden' por defecto, 'flex' en md y superior
    >
      {links.map((link, index) => (
        <React.Fragment key={link.href}>
          <Button
            asChild
            variant="ghost"
            className="text-gray-700 hover:text-blue-750 font-semibold text-base"
          >
            <Link href={link.href}>{link.label}</Link>
          </Button>
          {index < links.length - 1 && (
            <Separator orientation="vertical" className="h-6 bg-gray-300" />
          )}
        </React.Fragment>
      ))}
    </motion.div>
  );
};

export default DesktopNavLinks;
