import "dotenv/config"; // Cargar variables de entorno
import { authenticateUser } from "../_logic/authenticateUser.js";
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "../../../lib/db/connection.js";
import { User } from "../../../lib/db/models/index.js";

const { DATABASE_URL, DATABASE_NAME } = process.env;

console.info("DATABASE_URL", DATABASE_URL);
console.info("DATABASE_NAME", DATABASE_NAME);

(async () => {
  console.info("TEST authenticateUser");

  try {
    // Conectar a la base de datos
    await connectToDatabase(DATABASE_URL, DATABASE_NAME);

    // Limpiar la colección User para pruebas limpias
    await User.deleteMany({});

    // Registrar un usuario para usar en las pruebas
    const userData = {
      name: "Lio Messi",
      email: "lio@messi.com",
      password: "123123123",
    };
    const registeredUser = await registerUser(userData);

    console.info("Ejecutando pruebas...");

    // Test 1: Autenticación exitosa
    const loginData = {
      email: userData.email,
      password: userData.password,
    };
    const authResult = await authenticateUser(loginData);
    console.assert(authResult !== undefined, "Auth result is undefined");
    console.assert(
      authResult.id === registeredUser._id.toString(),
      "ID mismatch"
    );
    console.assert(authResult.role === registeredUser.role, "Role mismatch");
    console.assert(authResult.name === registeredUser.name, "Name mismatch");
    console.info("✔️ Test 1: Autenticación exitosa pasó");

    // Test 2: Credenciales incorrectas
    try {
      await authenticateUser({
        email: userData.email,
        password: "wrongpassword",
      });
      console.error(
        "❌ Test 2 falló: No lanzó error por credenciales incorrectas"
      );
    } catch (error) {
      console.assert(
        error.message.includes("Invalid email or password"),
        "No se detectó error de credenciales incorrectas"
      );
      console.info("✔️ Test 2: Credenciales incorrectas pasó");
    }

    // Test 3: Usuario no existente
    try {
      await authenticateUser({
        email: "nonexistent@user.com",
        password: "123123123",
      });
      console.error("❌ Test 3 falló: No lanzó error por usuario no existente");
    } catch (error) {
      console.assert(
        error.message.includes("User not found"),
        "No se detectó error de usuario no existente"
      );
      console.info("✔️ Test 3: Usuario no existente pasó");
    }

    console.info("✔️ Todas las pruebas han pasado con éxito");
  } catch (error) {
    console.error("❌ Test global falló:", error.message);
  } finally {
    // Limpiar la colección y desconectar de la base de datos
    await User.deleteMany({});
    await disconnectFromDatabase();
    console.info("Disconnected from database");
  }
})();
