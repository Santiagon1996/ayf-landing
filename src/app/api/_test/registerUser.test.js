import "dotenv/config"; // Cargar variables de entorno
import { registerUser } from "../_logic/registerUser.js";
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "../../../lib/db/connection.js";
import { User } from "../../../lib/db/models/index.js";
const { DATABASE_URL, DATABASE_NAME } = process.env;

console.info("DATABASE_URL", DATABASE_URL);
console.info("DATABASE_NAME", DATABASE_NAME);

(async () => {
  console.info("TEST registerUser");

  try {
    // Conectar a la base de datos
    await connectToDatabase(DATABASE_URL, DATABASE_NAME);

    // Limpiar la colección User para pruebas limpias
    await User.deleteMany({});

    // Ejecutar pruebas individuales
    console.info("Ejecutando pruebas...");

    // Test 1: Registro exitoso
    const userData = {
      name: "Lio Messi",
      email: "lio@messi.com",
      password: "123123123",
    };

    const result = await registerUser(userData);
    console.assert(result !== undefined, "Result is undefined");
    console.assert(result.name === userData.name, "Name mismatch");
    console.assert(result.email === userData.email, "Email mismatch");
    console.assert(
      result.password !== userData.password,
      "Password is not hashed"
    );
    console.info("✔️ Test 1: Registro exitoso pasó");

    // Test 2: Intentar registrar usuario duplicado
    try {
      await registerUser(userData);
      console.error("❌ Test 2 falló: No lanzó error de duplicidad");
    } catch (error) {
      console.assert(
        error.message.includes("User already exists"),
        "No se detectó error de duplicidad"
      );
      console.info("✔️ Test 2: Usuario duplicado pasó");
    }

    // Test 3: Registro con datos incompletos
    try {
      await registerUser({ name: "Incomplete User", email: "" });
      console.error("❌ Test 3 falló: No lanzó error de validación");
    } catch (error) {
      console.assert(
        error.message.includes("Validation"),
        "No se detectó error de validación"
      );
      console.info("✔️ Test 3: Validación de datos pasó");
    }

    console.info("✔️ Todas las pruebas han pasado con éxito");
  } catch (error) {
    console.error("❌ Test global falló:", error.message);
  } finally {
    // Desconectar de la base de datos y limpiar
    await User.deleteMany({});
    await disconnectFromDatabase();
    console.info("Disconnected from database");
  }
})();
