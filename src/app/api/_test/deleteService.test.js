import mongoose from "mongoose";
import { deleteService } from "@/app/api/_logic/deleteService.js"; // Asegúrate de que la ruta sea correcta
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "@/lib/db/connection.js"; // Tu función de conexión a la DB
import { Service, User } from "@/lib/db/models/index.js"; // Tus modelos reales de Mongoose
import { errors, validate } from "shared"; // 'errors' y 'validate' de tu módulo 'shared'

const { NotFoundError, ValidateError, SystemError, AuthorizationError } =
  errors; // Asegúrate de importar todos los errores que puedan ser lanzados
const { Types } = mongoose; // Para generar ObjectIds falsos

// Funciones auxiliares para la gestión de la base de datos de prueba
// Estas reemplazan las funciones como `clearTestDB`, `seedAdminUser`, `seedService`
// que estarían en un archivo `dbTestUtils.js`, manteniendo todo en un solo test file.

/**
 * Limpia las colecciones de usuarios y servicios en la base de datos de prueba.
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
    name: userData.name || "TestAdminDelete",
    email: userData.email || `testadmin.delete.${Date.now()}@example.com`,
    password: userData.password || "password123",
    role: "admin",
  });
  return admin;
};

/**
 * Crea un servicio de prueba en la base de datos.
 * @param {object} serviceData - Datos opcionales para el servicio.
 * @returns {Promise<Service>} El documento del servicio creado.
 */
const createTestService = async (serviceData = {}) => {
  const service = await Service.create({
    name: serviceData.name || `Servicio de Prueba para Eliminar ${Date.now()}`,
    type: serviceData.type || "juridico",
    category: serviceData.category || "asesoria-juridica",
    shortDescription: serviceData.shortDescription || "Descripción breve.",
    fullDescription: serviceData.fullDescription || "Descripción completa.",
    details: serviceData.details || ["Detalle 1", "Detalle 2"],
    iconUrl:
      serviceData.iconUrl ||
      "https://via.placeholder.com/64x64?text=DeleteIcon",
  });
  return service;
};

describe("deleteService - Tests de Lógica de Eliminación de Servicio", () => {
  let adminId; // ID del usuario administrador de prueba

  // Conectar a la base de datos y crear un usuario administrador antes de todas las pruebas
  beforeAll(async () => {
    // Es crucial que 'process.env.DATABASE_URL' apunte a tu DB de TEST.
    await connectToDatabase(
      process.env.DATABASE_URL,
      process.env.DATABASE_NAME
    );
    console.log(
      "Conexión a la base de datos de test establecida para deleteService tests."
    );

    // Limpiar completamente la base de datos antes de empezar los tests
    await clearCollections();

    // Crear un usuario administrador de prueba para todas las pruebas
    const adminUser = await createTestAdmin();
    adminId = adminUser._id.toString();
    console.log(`Usuario administrador de prueba creado con ID: ${adminId}`);
  }, 20000); // Aumenta el timeout para la configuración inicial de la DB

  // Limpiar las colecciones y crear un nuevo servicio antes de CADA prueba
  // Esto asegura que cada test se ejecute en un estado aislado y predecible.
  beforeEach(async () => {
    await clearCollections(); // Limpiar colecciones antes de cada test

    // NO creamos un servicio aquí si lo necesitamos para los tests específicos.
    // Los tests que necesiten un servicio existente lo crearán ellos mismos
    // o el test que lo elimine verificará que ha desaparecido.
    // El "happy path" creará uno justo antes de eliminarlo.
    console.log("Colecciones limpiadas antes de cada test.");
  });

  // Desconectar de la base de datos y limpiar usuarios/servicios después de todas las pruebas
  afterAll(async () => {
    await clearCollections(); // Limpiar la base de datos después de todos los tests
    await disconnectFromDatabase();
    console.log(
      "Conexión a la base de datos de test cerrada y datos limpiados."
    );
  }, 10000); // Timeout para la limpieza final

  //### Casos de Prueba

  test("should delete an existing service successfully", async () => {
    // Organizar: Crear un servicio que será eliminado en este test
    const serviceToDelete = await createTestService();
    const serviceId = serviceToDelete._id.toString();

    // Actuar: Llamar a la función deleteService
    await deleteService(adminId, serviceId);

    // Afirmar: Verificar que el servicio fue realmente eliminado de la base de datos
    const deletedServiceInDb = await Service.findById(serviceId);
    expect(deletedServiceInDb).toBeNull(); // Esperamos que el servicio ya no exista
  }, 10000);

  test("should throw NotFoundError if service is not found after valid ID format", async () => {
    // Organizar: Crear un ID con formato válido pero que sabemos que no existe en la DB
    const nonExistentServiceId = new Types.ObjectId().toString();

    // Actuar y Afirmar: Esperar que se lance un NotFoundError
    await expect(deleteService(adminId, nonExistentServiceId)).rejects.toThrow(
      NotFoundError
    );
    await expect(deleteService(adminId, nonExistentServiceId)).rejects.toThrow(
      "Service not found"
    ); // Verificar el mensaje específico
  }, 10000);

  test("should throw ValidateError for invalid adminId format", async () => {
    // Organizar: Un ID de administrador con formato inválido
    const invalidAdminId = "invalid-id-format"; // ID con formato incorrecto
    const serviceId = new Types.ObjectId().toString(); // Usar un ID de servicio válido para el formato

    // Actuar y Afirmar: Esperar que se lance un ValidateError debido al formato inválido del ID
    await expect(deleteService(invalidAdminId, serviceId)).rejects.toThrow(
      ValidateError
    );
    // Verificar el mensaje específico que tu `validateId` lanza para ID inválido
    await expect(deleteService(invalidAdminId, serviceId)).rejects.toThrow(
      "Validation failed for user ID"
    );
  }, 10000);

  test("should throw ValidateError for invalid serviceId format", async () => {
    // Organizar: Un ID de servicio con formato inválido
    const invalidServiceId = "another-invalid-id"; // ID con formato incorrecto
    const adminIdForTest = adminId; // Usar un ID de administrador válido

    // Actuar y Afirmar: Esperar que se lance un ValidateError debido al formato inválido del ID
    await expect(
      deleteService(adminIdForTest, invalidServiceId)
    ).rejects.toThrow(ValidateError);
    // Verificar el mensaje específico que tu `validateId` lanza para ID inválido
    await expect(
      deleteService(adminIdForTest, invalidServiceId)
    ).rejects.toThrow("Validation failed for user ID");
  }, 10000);

  test("should throw SystemError for unexpected database error (simulated)", async () => {
    // Organizar: Simular un error inesperado de la base de datos.
    // Esto se logra temporalmente reemplazando el método findByIdAndDelete con un mock que falla.
    // Es una técnica común en pruebas de integración para cubrir rutas de error difíciles de inducir.
    const errorMessage = "Simulated DB connection error";
    const serviceId = new Types.ObjectId().toString(); // Un ID válido para el formato

    // Guardar el método original para restaurarlo después
    const originalFindByIdAndDelete = Service.findByIdAndDelete;
    // Sobrescribir temporalmente el método para que lance un error genérico
    Service.findByIdAndDelete = jest
      .fn()
      .mockRejectedValue(new Error(errorMessage));

    // Actuar y Afirmar
    await expect(deleteService(adminId, serviceId)).rejects.toThrow(
      SystemError
    );
    await expect(deleteService(adminId, serviceId)).rejects.toThrow(
      `Error deleting Service: ${errorMessage}`
    );

    // Limpiar: Restaurar el método original del modelo
    Service.findByIdAndDelete = originalFindByIdAndDelete;
  }, 10000);

  test("should throw NotFoundError if Mongoose CastError occurs for serviceId", async () => {
    // Organizar: Proporcionar un string que no sea un ObjectId válido pero que pase tu `validateId`
    // si `validateId` no es 100% estricta en validar un ObjectId de Mongoose.
    // Ej: un string de 24 caracteres que no es un hexadecimal válido para Mongoose.
    // Si tu `validateId` con `ID_REGEX` ya valida esto, este test podría no ser alcanzado.
    // Pero lo incluimos para asegurar que tu bloque `catch (error instanceof mongoose.Error.CastError)` funciona.
    const invalidCastId = "aaaaaaaaaaaaaaaaaaaaaaaa"; // 24 caracteres, pero posiblemente no un ObjectId válido para Mongoose

    // Mockear la función validateId para que no lance un error, permitiendo que Mongoose genere el CastError
    const originalValidateId = validate.validateId;
    validate.validateId = jest.fn(); // Mockea validateId para que no falle en formato

    // Simular que findByIdAndDelete lanza un CastError de Mongoose
    const originalFindByIdAndDelete = Service.findByIdAndDelete;
    const castError = new mongoose.Error.CastError(
      "ObjectId",
      invalidCastId,
      "_id"
    );
    Service.findByIdAndDelete = jest.fn().mockRejectedValue(castError);

    // Actuar y Afirmar
    await expect(deleteService(adminId, invalidCastId)).rejects.toThrow(
      NotFoundError
    );
    await expect(deleteService(adminId, invalidCastId)).rejects.toThrow(
      "Service not found"
    );

    // Limpiar: Restaurar las funciones originales
    validate.validateId = originalValidateId;
    Service.findByIdAndDelete = originalFindByIdAndDelete;
  }, 10000);
});
