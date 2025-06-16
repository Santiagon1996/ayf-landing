import mongoose from "mongoose";
import { addService } from "@/app/api/_logic/index.js"; // Asegúrate de que la ruta sea correcta a tu addService
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "@/lib/db/connection.js"; // Tu función de conexión a la DB
import { Service, User } from "@/lib/db/models/index.js"; // Tus modelos reales de Mongoose

import { errors } from "shared"; // Tus errores personalizados
import { validate } from "shared"; // Importar validate para usar validateId si ensureAdminAuth lo necesita

const { DuplicityError, ValidateError, SystemError, AuthorizationError } =
  errors;
const { Types } = mongoose; // Para generar ObjectIds

// --- Funciones auxiliares para la gestión de la base de datos de prueba ---

/**
 * Limpia las colecciones de servicios y usuarios en la base de datos de prueba.
 */
const clearCollections = async () => {
  await Service.deleteMany({});
  await User.deleteMany({});
};

/**
 * Crea un usuario administrador de prueba en la base de datos.
 * @param {object} userData - Datos opcionales para el usuario.
 * @returns {Promise<User>} El documento del usuario creado.
 */
const createTestAdmin = async (userData = {}) => {
  const admin = await User.create({
    name: userData.name || "TestServiceAdmin",
    email: userData.email || `testserviceadmin${Date.now()}@example.com`,
    password: userData.password || "securetestpassword",
    role: "admin", // Asegúrate de que este rol 'admin' exista en tu modelo User
  });
  return admin;
};

// --- Test Suite para addService ---
describe("addService - Tests de Lógica de Creación de Servicios", () => {
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

    // Limpiar completamente la base de datos antes de empezar los tests
    await clearCollections();

    // *** Crear un usuario administrador de prueba ***
    const adminUser = await createTestAdmin();
    adminId = adminUser._id.toString(); // Guarda el ID del usuario creado como string, crucial para validateId
    console.log(`Usuario administrador de prueba creado con ID: ${adminId}`);
  }, 20000); // Aumenta el timeout para la configuración inicial de la DB

  // Limpiar la colección de servicios y restaurar mocks después de cada prueba
  afterEach(async () => {
    await Service.deleteMany({});
    console.log("Colección de servicios limpiada después del test.");
    jest.restoreAllMocks(); // Restaura todos los mocks de Jest para evitar contaminación entre tests.
  });

  // Desconectar de la base de datos y limpiar el usuario administrador y los servicios después de que todas las pruebas hayan terminado
  afterAll(async () => {
    await clearCollections(); // Limpia todos los servicios y usuarios (incluido el admin)
    await disconnectFromDatabase();
    console.log(
      "Conexión a la base de datos de test cerrada y usuarios/servicios limpiados."
    );
  }, 10000); // Timeout para la limpieza final

  // --- Test 1: Servicio agregado exitoso ---
  test("should add a new service successfully", async () => {
    const serviceData = {
      name: "Servicio Juridico Nuevo " + Date.now(), // Al menos 3 caracteres
      category: "asesoria-juridica", // Uno de los valores válidos del enum de Zod
      type: "juridico", // Uno de los valores válidos del enum de Zod
      shortDescription:
        "Esta es una descripción breve y suficiente para el servicio de prueba exitoso, cumpliendo el mínimo.", // Al menos 1 caracter
      fullDescription:
        "Aquí va el contenido completo del servicio, es un texto suficientemente largo y detallado para cumplir con cualquier requisito mínimo.", // Al menos 1 caracter
      details: [
        "Detalle principal del servicio",
        "Otro detalle relevante del servicio",
      ], // Array de strings, cada string con al menos 1 caracter
      iconUrl: "https://www.example.com/valid_icon_success.png", // URL válida
    };

    const result = await addService(serviceData, adminId);

    // Aserciones sobre el resultado devuelto por addService
    expect(result).toBeDefined();
    expect(result.name).toBe(serviceData.name);
    expect(result.category).toBe(serviceData.category);
    expect(result.type).toBe(serviceData.type);
    expect(result.shortDescription).toBe(serviceData.shortDescription);
    expect(result.fullDescription).toBe(serviceData.fullDescription);
    expect(result.details).toEqual(expect.arrayContaining(serviceData.details));
    expect(result.iconUrl).toBe(serviceData.iconUrl);
    expect(result._id).toBeDefined(); // Verifica que se haya asignado un _id

    // Verificar que el servicio se haya guardado correctamente en la DB
    const serviceInDb = await Service.findById(result._id);
    expect(serviceInDb).toBeDefined();
    expect(serviceInDb.name).toBe(serviceData.name);
    expect(serviceInDb.category).toBe(serviceData.category);
    expect(serviceInDb.type).toBe(serviceData.type);
  }, 15000); // Aumenta el timeout si la DB tarda

  // --- Test 2: Servicio duplicado ---
  test("should throw DuplicityError if service with same name already exists", async () => {
    const serviceName = "Servicio Contable Duplicado " + Date.now();
    const serviceData = {
      name: serviceName, // Al menos 3 caracteres
      category: "area-contable-fiscal", // Uno de los valores válidos del enum de Zod
      type: "contable", // Uno de los valores válidos del enum de Zod
      shortDescription:
        "Descripción para servicio duplicado de prueba, asegurando la longitud mínima requerida.", // Al menos 1 caracter
      fullDescription:
        "Contenido completo para el test de servicio duplicado, es extenso y cumple las validaciones.", // Al menos 1 caracter
      details: ["Detalle único para el servicio duplicado"], // Array de strings, cada string con al menos 1 caracter
      iconUrl: "https://www.example.com/valid_icon_duplicate.png", // URL válida
    };

    // Primero, agrega el servicio exitosamente
    await addService(serviceData, adminId);

    // Luego, intenta agregarlo de nuevo con el mismo nombre
    await expect(addService(serviceData, adminId)).rejects.toThrow(
      DuplicityError
    );
    await expect(addService(serviceData, adminId)).rejects.toThrow(
      "Service already exists with this name." // Asegúrate de que este mensaje coincida exactamente con tu lógica
    );
  }, 15000);

  // --- Test 3: Validación de datos incorrectos ---
  test("should throw ValidateError for invalid service data", async () => {
    const invalidServiceData = {
      name: "S", // Demasiado corto (min 3)
      category: "categoria-no-valida", // NO válida (no en el enum)
      type: "tipo-no-valido", // NO válido (no en el enum)
      shortDescription: "", // Demasiado corta (min 1)
      fullDescription: "", // Demasiado corta (min 1)
      details: [], // Array vacío si se espera al menos uno
      iconUrl: "url-invalida", // URL malformada
    };

    await expect(addService(invalidServiceData, adminId)).rejects.toThrow(
      ValidateError
    );
    await expect(addService(invalidServiceData, adminId)).rejects.toThrow(
      /Validation failed for service data/ // Mensaje general para validación fallida
    );
  }, 10000);

  // --- Test 4: Lanzar AuthorizationError si adminId no encontrado ---
  test("should throw AuthorizationError if adminId is not found", async () => {
    // Genera un ID de Mongoose válido, pero que no existirá en la DB
    const nonExistentAdminId = new Types.ObjectId().toString();

    // Asegúrate de que los datos del servicio sean VÁLIDOS aquí para que la validación de Zod pase y se pruebe la autorización
    const serviceData = {
      name: "Servicio Sin Autorizacion " + Date.now(), // Al menos 3 caracteres
      category: "area-financiera", // Uno de los valores válidos del enum de Zod
      type: "juridico", // Uno de los valores válidos del enum de Zod
      shortDescription:
        "Descripción para test de autorización, suficientemente larga.", // Al menos 1 caracter
      fullDescription:
        "Contenido para test de autorización, es largo y detallado, cumpliendo validaciones.", // Al menos 1 caracter
      details: ["Detalle de autorización"], // Array de strings, cada string con al menos 1 caracter
      iconUrl: "https://www.example.com/valid_icon_auth.png", // URL válida
    };

    await expect(addService(serviceData, nonExistentAdminId)).rejects.toThrow(
      AuthorizationError
    );
    // Asegúrate de que el mensaje esperado coincida con lo que lanza ensureAdminAuth
    await expect(addService(serviceData, nonExistentAdminId)).rejects.toThrow(
      "Unauthorized: Invalid or insufficient permissions."
    );
  }, 10000);

  // --- Test 5: Lanzar SystemError por error de base de datos (simulado) ---
  test("should throw SystemError on unexpected database creation failure (simulated)", async () => {
    // Asegúrate de que los datos del servicio sean VÁLIDOS aquí
    const serviceData = {
      name: "Servicio con Error de Sistema " + Date.now(), // Al menos 3 caracteres
      category: "servicios-complementarios", // Uno de los valores válidos del enum de Zod
      type: "contable", // Uno de los valores válidos del enum de Zod
      shortDescription:
        "Descripción para test de error de sistema, suficientemente larga y detallada.", // Al menos 1 caracter
      fullDescription:
        "Contenido para test de error de sistema simulado en DB, es largo y detallado y cumple las reglas.", // Al menos 1 caracter
      details: ["Detalle de error del sistema"], // Array de strings, cada string con al menos 1 caracter
      iconUrl: "https://www.example.com/valid_icon_system_error.png", // URL válida
    };

    // Mockea Service.create para que siempre falle con un error genérico
    const serviceCreateSpy = jest.spyOn(Service, "create");
    serviceCreateSpy.mockRejectedValue(
      new Error("Simulated DB connection issue")
    );

    await expect(addService(serviceData, adminId)).rejects.toThrow(SystemError);
    await expect(addService(serviceData, adminId)).rejects.toThrow(
      "Error creating service" // Este es el mensaje de SystemError que tu lógica lanza
    );

    // jest.restoreAllMocks() en afterEach se encargará de limpiar este mock automáticamente.
  }, 10000);
});
