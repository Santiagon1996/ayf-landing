import "dotenv/config";
import jwt from "jsonwebtoken"; // Para generar JWTs de prueba
import { getUserFromToken } from "../_logic/getUserFromToken.js";
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "../../../lib/db/connection.js";
import { User } from "../../../lib/db/models/index.js";
import { errors } from "shared";

const { AuthorizationError, SystemError } = errors;
const { DATABASE_URL, DATABASE_NAME, JWT_SECRET } = process.env;

// Validar que JWT_SECRET esté definido
if (!JWT_SECRET) {
  console.error(
    "❌ Error: JWT_SECRET no está definido en las variables de entorno."
  );
  process.exit(1);
}

console.info("DATABASE_URL:", DATABASE_URL);
console.info("DATABASE_NAME:", DATABASE_NAME);
console.info(
  "JWT_SECRET (primeros 5 caracteres):",
  JWT_SECRET ? JWT_SECRET.substring(0, 5) + "..." : "N/A"
);

(async () => {
  console.info("\n--- INICIANDO TEST: getUserFromToken ---");

  let testUser; // Para almacenar el usuario de prueba

  try {
    // 1. Conectar a la base de datos de pruebas
    await connectToDatabase(DATABASE_URL, DATABASE_NAME);
    console.info("✅ Conectado a la base de datos de pruebas.");

    // 2. Limpiar la colección User y crear un usuario de prueba
    await User.deleteMany({});
    console.info("✅ Colección 'User' limpiada.");

    testUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "testpassword", // La contraseña no importa para este test ya que no la validamos
      role: "admin",
    });
    console.info("✅ Usuario de prueba creado:", testUser.email);

    // --- Casos de prueba para getUserFromToken ---

    // Test 1: Token válido y usuario existente
    console.info("\n-> Test 1: Token válido y usuario existente");
    const validToken = jwt.sign(
      { id: testUser._id.toString(), role: testUser.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    try {
      const userResult = await getUserFromToken(validToken);
      console.assert(
        userResult !== undefined,
        "Test 1: Resultado no debe ser undefined"
      );
      console.assert(
        userResult.id === testUser._id.toString(),
        "Test 1: ID de usuario incorrecto"
      );
      console.assert(
        userResult.email === testUser.email,
        "Test 1: Email de usuario incorrecto"
      );
      console.assert(
        userResult.role === testUser.role,
        "Test 1: Rol de usuario incorrecto"
      );
      console.assert(
        userResult.password === undefined,
        "Test 1: La contraseña no debe ser devuelta"
      );
      console.info("✔️ Test 1: Token válido y usuario existente pasó.");
    } catch (error) {
      console.error("❌ Test 1 falló:", error.message);
    }

    // Test 2: No se proporciona ningún token
    console.info("\n-> Test 2: No se proporciona ningún token");
    try {
      await getUserFromToken(null);
      console.error("❌ Test 2 falló: No lanzó error por token nulo");
    } catch (error) {
      console.assert(
        error instanceof AuthorizationError,
        "Test 2: Debe lanzar AuthorizationError"
      );
      console.assert(
        error.message.includes("No authentication token found"),
        "Test 2: Mensaje de error incorrecto"
      );
      console.info("✔️ Test 2: No se proporciona ningún token pasó.");
    }

    // Test 3: Token inválido (formato incorrecto)
    console.info("\n-> Test 3: Token inválido (formato incorrecto)");
    try {
      await getUserFromToken("invalid.jwt.token");
      console.error("❌ Test 3 falló: No lanzó error por token inválido");
    } catch (error) {
      console.assert(
        error instanceof AuthorizationError,
        "Test 3: Debe lanzar AuthorizationError"
      );
      console.assert(
        error.message.includes("Invalid or expired authentication token."),
        "Test 3: Mensaje de error incorrecto"
      );
      console.info("✔️ Test 3: Token inválido (formato incorrecto) pasó.");
    }

    // Test 4: Token con firma incorrecta (secret diferente)
    console.info("\n-> Test 4: Token con firma incorrecta");
    const wrongSignedToken = jwt.sign(
      { id: testUser._id.toString(), role: testUser.role },
      "otro_secreto_diferente",
      { expiresIn: "1h" }
    );
    try {
      await getUserFromToken(wrongSignedToken);
      console.error("❌ Test 4 falló: No lanzó error por firma incorrecta");
    } catch (error) {
      console.assert(
        error instanceof AuthorizationError,
        "Test 4: Debe lanzar AuthorizationError"
      );
      console.assert(
        error.message.includes("Invalid or expired authentication token."),
        "Test 4: Mensaje de error incorrecto"
      );
      console.info("✔️ Test 4: Token con firma incorrecta pasó.");
    }

    // Test 5: Token expirado
    console.info("\n-> Test 5: Token expirado");
    const expiredToken = jwt.sign(
      { id: testUser._id.toString(), role: testUser.role },
      JWT_SECRET,
      { expiresIn: "0s" }
    );
    // Damos un pequeño respiro para que el token expire
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      await getUserFromToken(expiredToken);
      console.error("❌ Test 5 falló: No lanzó error por token expirado");
    } catch (error) {
      console.assert(
        error instanceof AuthorizationError,
        "Test 5: Debe lanzar AuthorizationError"
      );
      console.assert(
        error.message.includes("Invalid or expired authentication token."),
        "Test 5: Mensaje de error incorrecto"
      );
      console.info("✔️ Test 5: Token expirado pasó.");
    }

    // Test 6: Usuario no encontrado en la BD (ID válido en token pero no en DB)
    console.info("\n-> Test 6: Usuario no encontrado en la BD");
    // Eliminamos el usuario para simular que no existe
    await User.findByIdAndDelete(testUser._id);
    const validTokenForNonExistentUser = jwt.sign(
      { id: testUser._id.toString(), role: testUser.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    try {
      await getUserFromToken(validTokenForNonExistentUser);
      console.error(
        "❌ Test 6 falló: No lanzó error por usuario no encontrado"
      );
    } catch (error) {
      console.assert(
        error instanceof AuthorizationError,
        "Test 6: Debe lanzar AuthorizationError"
      );
      console.assert(
        error.message.includes("Authenticated user not found in the database."),
        "Test 6: Mensaje de error incorrecto"
      );
      console.info("✔️ Test 6: Usuario no encontrado en la BD pasó.");
    }

    // Test 7: Error interno al buscar usuario en la BD (simulando un error de DB)
    console.info("\n-> Test 7: Error interno al buscar usuario en la BD");
    // Mockear la función findById para que lance un error
    const originalFindById = User.findById;
    User.findById = async () => {
      throw new Error("Simulated DB error");
    };

    // Volver a crear un usuario para este test ya que lo borramos en el Test 6
    testUser = await User.create({
      name: "Another User",
      email: "another@example.com",
      password: "testpassword",
      role: "admin",
    });
    const tokenForSimulatedError = jwt.sign(
      { id: testUser._id.toString(), role: testUser.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    try {
      await getUserFromToken(tokenForSimulatedError);
      console.error("❌ Test 7 falló: No lanzó error interno de DB");
    } catch (error) {
      console.assert(
        error instanceof SystemError,
        "Test 7: Debe lanzar SystemError"
      );
      console.assert(
        error.message.includes("Error fetching user data from database."),
        "Test 7: Mensaje de error incorrecto"
      );
      console.info("✔️ Test 7: Error interno al buscar usuario en la BD pasó.");
    } finally {
      // Restaurar la función findById original
      User.findById = originalFindById;
      await User.deleteMany({}); // Limpiar de nuevo por si acaso
    }

    console.info(
      "\n--- TODOS LOS TESTS PARA getUserFromToken HAN FINALIZADO ---"
    );
  } catch (globalError) {
    console.error("❌ Error global en el test:", globalError.message);
    process.exit(1);
  } finally {
    // Limpiar la colección y desconectar de la base de datos
    await User.deleteMany({});
    await disconnectFromDatabase();
    console.info("✅ Desconectado de la base de datos.");
  }
})();
