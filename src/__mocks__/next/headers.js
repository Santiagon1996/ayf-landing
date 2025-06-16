// your-project-root/__mocks__/next/headers.js

// 1. Declaramos e inicializamos las funciones mockeadas usando 'export'
// para que puedan ser importadas por tu archivo de test.
export const mockDelete = jest.fn();
export const mockCookies = jest.fn(() => ({
  delete: mockDelete,
  // Agrega otros métodos si tu lógica los usa, por ejemplo:
  // get: jest.fn(),
  // set: jest.fn(),
}));

// 2. Exportamos lo que el módulo 'next/headers' exporta realmente.
// En este caso, 'next/headers' exporta la función 'cookies'.
// La renombramos como 'cookies' para que coincida con la importación real.
export const cookies = mockCookies;
