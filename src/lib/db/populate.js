import "dotenv/config";
import { connectToDatabase, disconnectFromDatabase } from "./connection.js";
import { User } from "./models/index.js";

async function populateDatabase() {
  // Conectar a la base de datos
  await connectToDatabase();

  // Datos de ejemplo para poblar
  const users = [
    {
      name: "Lio Messi",
      email: "lio@messi.com",
      password: "123123123",
      role: "admin",
    },
    {
      name: "Cristiano Ronaldo",
      email: "cris@ronaldo.com",
      password: "123123123",
      role: "admin",
    },
  ];

  try {
    // Verificar si la base de datos ya tiene datos
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      console.log(
        "La base de datos ya está poblada. No se insertarán datos duplicados."
      );
      await disconnectFromDatabase();
      return;
    }

    // Insertar los datos usando User.create
    for (const userData of users) {
      try {
        const createdUser = await User.create(userData); // Activará middlewares
        console.log(
          `Usuario ${createdUser.email} creado exitosamente con ID ${createdUser._id}`
        );
      } catch (error) {
        console.error(
          `Error creando usuario ${userData.email}:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error("Error al poblar la base de datos:", error);
  } finally {
    // Desconexión garantizada
    try {
      await disconnectFromDatabase();
      console.log("Desconectado de la base de datos");
    } catch (disconnectError) {
      console.error("Error al desconectar:", disconnectError.message);
    }
  }

  process.exit(0); // Salida controlada
}

populateDatabase();
