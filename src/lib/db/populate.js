import "dotenv/config";
import { connectToDatabase, disconnectFromDatabase } from "./connection.js";
import { User } from "./models/index.js";
import { Service } from "./models/index.js";
import { services as servicesData } from "./serviceData.js";

async function populateDatabase() {
  // Conectar a la base de datos
  await connectToDatabase();
  console.log("Conectado a la base de datos.");

  // Datos de ejemplo para poblar
  const users = [
    {
      name: "admin",
      email: "admin@admin.com",
      password: "123123123",
      role: "admin",
    },
  ];

  try {
    // --- Poblar Usuarios ---
    const existingUsersCount = await User.countDocuments();
    if (existingUsersCount === 0) {
      console.log(
        "No se encontraron usuarios. Insertando usuarios de ejemplo..."
      );
      for (const userData of users) {
        try {
          const createdUser = await User.create(userData);
          console.log(`Usuario ${createdUser.email} creado exitosamente.`);
        } catch (error) {
          if (error.code === 11000) {
            // Duplicado key error
            console.warn(`Usuario ${userData.email} ya existe. Saltando.`);
          } else {
            console.error(
              `Error creando usuario ${userData.email}:`,
              error.message
            );
          }
        }
      }
    } else {
      console.log(
        `Ya existen ${existingUsersCount} usuarios. No se insertarán nuevos usuarios.`
      );
    }

    // --- Poblar Servicios ---
    const existingServicesCount = await Service.countDocuments();
    if (existingServicesCount === 0) {
      console.log(
        "No se encontraron servicios. Insertando servicios de ejemplo..."
      );
      for (const serviceData of servicesData) {
        try {
          const createdService = await Service.create(serviceData); // Creará el slug automáticamente
          console.log(`Servicio "${createdService.name}" creado exitosamente.`);
        } catch (error) {
          if (error.code === 11000) {
            // Duplicado key error (name o slug)
            console.warn(
              `Servicio "${serviceData.name}" ya existe o su slug es duplicado. Saltando.`
            );
          } else {
            console.error(
              `Error creando servicio "${serviceData.name}":`,
              error.message
            );
          }
        }
      }
    } else {
      console.log(
        `Ya existen ${existingServicesCount} servicios. No se insertarán nuevos servicios.`
      );
    }

    console.log("Población de la base de datos completada.");
  } catch (error) {
    console.error("Error al poblar la base de datos:", error);
  } finally {
    // Desconexión garantizada
    try {
      await disconnectFromDatabase();
      console.log("Desconectado de la base de datos.");
    } catch (disconnectError) {
      console.error("Error al desconectar:", disconnectError.message);
    }
    process.exit(0); // Salida controlada
  }
}

populateDatabase();
