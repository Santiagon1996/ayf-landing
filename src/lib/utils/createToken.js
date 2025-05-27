import jwt from "jsonwebtoken";

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

// Validación de variables de entorno críticas
if (!JWT_SECRET) {
  throw new Error(
    "La clave secreta JWT (JWT_SECRET) no está definida en las variables de entorno."
  );
}

if (!JWT_EXPIRES_IN) {
  console.warn(
    "JWT_EXPIRES_IN no está definido. Usando el valor predeterminado de 1h."
  );
}

export const createToken = (id, role) => {
  const payload = { id, role };
  const options = { expiresIn: JWT_EXPIRES_IN || "1h" }; // Valor por defecto si no está definido

  return jwt.sign(payload, JWT_SECRET, options);
};
