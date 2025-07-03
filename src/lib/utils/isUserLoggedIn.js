// src/lib/utils/isUserLoggedIn.js

/**
 * Checks if the 'accessToken' cookie is present in the browser.
 * This is a client-side utility function.
 * @returns {boolean} True if the accessToken cookie is found, false otherwise.
 */
export const isUserLoggedIn = () => {
  // En el navegador, document.cookie contiene todas las cookies como una cadena.
  // Buscamos la cookie 'accessToken=' en esa cadena.
  // Nota: Esto solo verifica la PRESENCIA. La VALIDEZ la hace el server-side `withAuth`.
  return document.cookie.includes("accessToken=");
};
