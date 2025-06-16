// jest.config.cjs
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./", // Esto debe apuntar a la raíz de tu proyecto Next.js
});

/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"], // <-- Verifica esta ruta
  testEnvironment: "node", // Considera 'jsdom' si testeas componentes React o cosas del navegador.
                           // 'node' es para tests de backend o utilidades.
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Ajusta si tus alias de rutas son diferentes
    // Puedes añadir aquí el mock para 'next/headers' si no está en un archivo de setup global
    // 'next/headers': '<rootDir>/__mocks__/next/headers.js',
  },
  // --- CAMBIO CLAVE AQUÍ: Usar @swc/jest para la transformación ---
  transform: {
    // Le dice a Jest que use @swc/jest para todos los archivos .js, .jsx, .ts, .tsx
    // Si necesitas .mjs, también puedes añadirlo aquí: '^.+\\.(t|j)sx?|mjs)$'
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  // --- Fin del cambio clave ---

  transformIgnorePatterns: [
    "/node_modules/(?!next-auth|@babel|lodash-es)", // '@babel' ya no sería necesario si no usas babel-jest
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "\\.sh$", // Ignora tus scripts bash
  ],
};

module.exports = createJestConfig(customJestConfig);