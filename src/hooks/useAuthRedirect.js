// src/hooks/useAuthRedirect.js
"use client"; // Esta directiva es crucial para que Next.js sepa que es código de cliente

import { useRouter } from "next/navigation";
// Asegúrate de que esta ruta sea correcta para tu archivo isUserLoggedIn.js
import { isUserLoggedIn } from "@/lib/utils/isUserLoggedIn"; // Ajusta la ruta según tu estructura de carpetas

const useAuthRedirect = () => {
  const router = useRouter();

  const handleAuthRedirect = () => {
    if (isUserLoggedIn()) {
      router.push("/dashboard");
    } else {
      // Usamos "/auth" como tu ruta de login
      router.push("/login");
    }
  };

  return handleAuthRedirect;
};

export default useAuthRedirect;
