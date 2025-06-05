// jest.config.js (¡Este es el contenido correcto!)
const nextJest = require("next/jest"); // <-- Usar require()

const createJestConfig = nextJest({
  dir: "./", // Esto debe apuntar a la raíz de tu proyecto Next.js
});

/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"], // <-- Verifica esta ruta
  testEnvironment: "node", // Usa jsdom para emular el navegador
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Ajusta si tus alias de rutas son diferentes
  },
  // Esto es crucial para Babel y la transformación de archivos JS/JSX/TS/TSX/MJS
  transform: {
    // Asegúrate de que el path a babel.config.js sea correcto
    // Si babel.config.js está en la raíz, './babel.config.js' es correcto
    "^.+\\.(js|jsx|ts|tsx|mjs)$": [
      "babel-jest",
      { configFile: "./babel.config.cjs" },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!next-auth|@babel|lodash-es)", // Permite la transformación de estos módulos si es necesario
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "\\.sh$", // Ignora tus scripts bash
  ],
};

// createJestConfig es una función que devuelve un objeto de configuración de Jest
// que ha sido extendido con la configuración específica de Next.js.
module.exports = createJestConfig(customJestConfig); // <-- Usar module.exports
