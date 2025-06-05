// jest.setup.js

// Importar el polyfill de TextEncoder/TextDecoder
// Esto es necesario porque algunos paquetes (como Mongoose/MongoDB)
// pueden usar estas APIs que son de entorno de navegador,
// y en un entorno Jest/Node, podrían no estar disponibles globalmente.
import { TextEncoder, TextDecoder } from "util"; // Node.js 'util' module

// Asegurarse de que estén disponibles globalmente para Jest
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}

// Opcional: Configuración adicional para Jest Testing Library (si la usas)
import "@testing-library/jest-dom";

// Opcional: Configurar variables de entorno para tests
// Asegúrate de que process.env.DATABASE_URL y process.env.DATABASE_NAME
// apunten a tu base de datos de test.
// Por ejemplo, si tienes un .env.test o quieres sobrescribir:
// process.env.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/tu-db-test';
// process.env.DATABASE_NAME = process.env.DATABASE_NAME || 'tu-db-test';

console.log("Jest setup file loaded."); // Para verificar que se carga
