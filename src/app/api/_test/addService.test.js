import mongoose from "mongoose";
import { addService } from "@/app/api/_logic/addService.js";
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "@/lib/db/connection.js";
import { Service, User } from "@/lib/db/models/index.js"; // Asegúrate de importar User también

import { errors } from "shared";

const { DuplicityError, ValidateError, SystemError, AuthorizationError } =
  errors;
const { Types } = mongoose;

describe("addService - Happy Path", () => {
  let adminId; // Aquí guardaremos el ID del usuario administrador creado

  // Conectar a la base de datos y crear un usuario administrador antes de todos los tests
  beforeAll(async () => {
    await connectToDatabase(
      process.env.DATABASE_URL,
      process.env.DATABASE_NAME
    );
    console.log(
      "Conexión a la base de datos de test establecida para addService tests."
    );

    // *** Crear un usuario administrador de prueba ***
    const adminUser = await User.create({
      name: "testadmin",
      email: "admin@test.com",
      password: "securepassword", // Asegúrate de que tu modelo User acepte esto o adáptalo
      role: "admin", // Si tu modelo User tiene un campo de rol
      // Añade cualquier otro campo requerido por tu modelo User
    });
    adminId = adminUser._id; // Guarda el ID del usuario creado
    console.log(`Usuario administrador de prueba creado con ID: ${adminId}`);
  });

  // Limpiar la colección de servicios y usuarios después de cada prueba
  afterEach(async () => {
    await Service.deleteMany({});
    // No borres el adminUser aquí si lo necesitas para todos los tests.
    // Solo borra servicios creados en el test individual.
    console.log("Colección de servicios limpiada después del test.");
  });

  // Desconectar de la base de datos y limpiar el usuario administrador después de que todas las pruebas hayan terminado
  afterAll(async () => {
    await Service.deleteMany({}); // Limpia servicios por si acaso
    await User.deleteMany({}); // *** Limpia todos los usuarios, incluyendo el adminUser ***
    await disconnectFromDatabase();
    console.log(
      "Conexión a la base de datos de test cerrada y usuarios/servicios limpiados."
    );
  });

  // --- Test 1: Servicio agregado exitoso ---
  test("should add a new service successfully", async () => {
    const serviceData = {
      name: "Test Service " + Date.now(), // Usa un nombre único para evitar duplicidades entre tests
      category: "asesoria-juridica",
      type: "juridico",
      shortDescription: "Short desc",
      fullDescription: "Full desc",
      details: ["Details"],
      iconUrl: "http://icon.url",
    };

    // Pasa el adminId REAL obtenido de la base de datos
    const result = await addService(serviceData, adminId);

    expect(result).toBeDefined();
    expect(result.name).toBe(serviceData.name);
    // ... tus otras aserciones ...

    // Verificar que el servicio se haya guardado en la DB
    const serviceInDb = await Service.findById(result.id || result._id);
    expect(serviceInDb).toBeDefined();
    expect(serviceInDb.type).toBe(serviceData.type);
    expect(serviceInDb.name).toBe(serviceData.name);
    expect(serviceInDb.category).toBe(serviceData.category);
  }, 15000); // Aumenta el timeout a 15 segundos por si la DB tarda

  // --- Test 2: Servicio duplicado ---
  test("should throw DuplicityError if service already exists", async () => {
    const serviceData = {
      name: "Another Test Service " + Date.now(), // Usa un nombre único
      category: "asesoria-juridica",
      type: "juridico",
      shortDescription: "Short desc",
      fullDescription: "Full desc",
      details: ["Details"],
      iconUrl: "http://icon.url",
    };

    // Primero, agrega el servicio con el usuario real
    await addService(serviceData, adminId);

    // Luego, intenta agregarlo de nuevo
    await expect(addService(serviceData, adminId)).rejects.toThrow(
      DuplicityError
    );
  });

  // --- Test 3: Validación de datos incorrectos ---
  test("should throw ValidateError for invalid service data", async () => {
    const invalidServiceData = {
      name: "", // Nombre vacío
      category: "invalid_category", // Categoría no válida
      type: "invalid_type", // Tipo no válido
      shortDescription: "Short desc",
      fullDescription: "Full desc",
      details: ["Details"],
      iconUrl: "http://icon.url",
    };

    // Pasa el adminId real
    await expect(addService(invalidServiceData, adminId)).rejects.toThrow(
      ValidateError
    );
  });

  // --- Test para AuthorizationError: adminId no encontrado ---
  test("should throw AuthorizationError if adminId is not found", async () => {
    // Genera un ID que sabes que NO existe en la DB
    const nonExistentAdminId = new Types.ObjectId().toString();

    const serviceData = {
      name: "Service Not Authorized " + Date.now(),
      category: "asesoria-juridica",
      type: "juridico",
      shortDescription: "Short desc",
      fullDescription: "Full desc",
      details: ["Details"],
      iconUrl: "http://icon.url",
    };

    await expect(addService(serviceData, nonExistentAdminId)).rejects.toThrow(
      AuthorizationError
    );
    await expect(addService(serviceData, nonExistentAdminId)).rejects.toThrow(
      "Unauthorized"
    );
  });

  // Los tests que simulaban errores de la DB en findOne o create con mocks de Service
  // ya no son directamente aplicables de la misma manera si no quieres mockear.
  // Para probar esos escenarios sin mocks, necesitarías simular una desconexión
  // de la DB o una configuración incorrecta en tiempo de ejecución, lo cual es mucho
  // más complejo y generalmente se hace a un nivel de prueba más alto (E2E) o
  // se acepta que el mocking es la mejor manera de probar la resiliencia de la lógica
  // ante fallos de sus dependencias.
});
