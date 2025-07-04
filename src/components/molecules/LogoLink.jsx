"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import useAuthRedirect from "@/hooks/useAuthRedirect"; // Importa tu hook aquí

/**
 * Molécula: Representa el logo de la empresa que actúa como enlace al dashboard
 * o a la página de autenticación, con animación.
 */
const LogoLink = () => {
  const redirectToAuthOrDashboard = useAuthRedirect();

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Button
        asChild
        variant="link"
        className="p-0 h-auto"
        onClick={redirectToAuthOrDashboard}
      >
        <div className="flex items-center space-x-2 cursor-pointer">
          <Image
            src="/AyF-Logo.png"
            alt="Logo de la Empresa"
            width={100}
            height={100}
            className="rounded-full"
          />
        </div>
      </Button>
    </motion.div>
  );
};

export default LogoLink;
