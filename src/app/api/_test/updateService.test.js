import mongoose from "mongoose";
import { updateService } from "@/app/api/_logic/updateService.js"; // Asegúrate de que la ruta sea correcta
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "@/lib/db/connection.js";
import { Service, User } from "@/lib/db/models/index.js";
import { errors, validate } from "shared";
import { NotFoundError } from "@/shared/errors/errors"; // Asegúrate de que esta importación sea correcta

// Mock o ajuste para validateAndFilterUpdates si no se proporciona,
// o si quieres controlar su comportamiento en los tests
// Por simplicidad, aquí asumimos que funciona como se espera.
// Si validateAndFilterUpdates es un archivo separado, asegúrate de que esté correcto.
// Si lanza ValidateError, se debe simular ese comportamiento.
// Por ejemplo, si tienes que mockearlo:
// jest.mock('@/lib/utils/validateAndFilterUpdates', () => ({
//   validateAndFilterUpdates: jest.fn((updatesData) => {
//     // Simula la lógica de validación real o un error
//     if (updatesData && updatesData.name === '') {
//       const err = new errors.ValidateError('Invalid name');
//       err.details = [{ path: 'name', message: 'Name cannot be empty' }]; // Añade detalles si tu ValidateError los espera
//       throw err;
//     }
//     // Filtra actualizaciones válidas (ejemplo muy básico)
//     const validUpdates = {};
//     if (updatesData.name) validUpdates.name = updatesData.name;
//     if (updatesData.category) validUpdates.category = updatesData.category;
//     return validUpdates;
//   }),
// }));

const { SystemError, ValidateError, AuthorizationError, DuplicityError } =
  errors; // Asegúrate de que DuplicityError no se necesite si no se usa
const { Types } = mongoose; // Para generar ObjectIDs falsos

describe("updateService - Tests de Lógica de Actualización de Servicio", () => {
  let adminId; // ID del usuario administrador de prueba
  let testServiceId; // ID de un servicio de prueba creado para actualizar

  // Conectar a la base de datos y crear un usuario administrador y un servicio de prueba
  beforeAll(async () => {
    await connectToDatabase(
      process.env.DATABASE_URL,
      process.env.DATABASE_NAME
    );
    console.log(
      "Conexión a la base de datos de test establecida para updateService tests."
    );

    // Crear un usuario administrador de prueba
    const adminUser = await User.create({
      name: "admin",
      email: "admin-update@test.com",
      password: "securepassword",
      role: "admin",
    });
    adminId = adminUser._id.toString();
    console.log(`Usuario administrador de prueba creado con ID: ${adminId}`);

    // Crear un servicio de prueba que será actualizado
    const initialService = await Service.create({
      name: "Servicio Inicial para Actualizar",
      category: "asesoria-juridica",
      type: "juridico",
      shortDescription: "Descripción inicial corta",
      fullDescription: "Descripción inicial completa",
      details: ["Detalle inicial"],
      iconUrl: "http://initial.icon.url",
    });
    testServiceId = initialService._id.toString();
    console.log(
      `Servicio de prueba creado para actualizar con ID: ${testServiceId}`
    );
  }, 20000); // Aumenta el timeout para la configuración inicial

  // Limpiar solo los servicios después de cada prueba si se crearan más en el test individual
  // En este caso, como actualizamos un servicio preexistente, solo borraríamos si creáramos nuevos.
  // Para update, es más importante restaurar el estado del servicio después de cada test.
  afterEach(async () => {
    // Aquí puedes restaurar el servicio original si es necesario,
    // o simplemente borrar los cambios si cada test crea su propio servicio.
    // Para simplificar, si el testServiceId se mantiene, podrías recargarlo y resetearlo.
    // Para este ejemplo, confiamos en la limpieza de afterAll.
    console.log("Limpieza después de cada test (si aplica).");
  });

  // Desconectar de la base de datos y limpiar usuarios/servicios después de todas las pruebas
  afterAll(async () => {
    await Service.deleteMany({}); // Limpia todos los servicios
    await User.deleteMany({}); // Limpia todos los usuarios, incluyendo el adminUser
    await disconnectFromDatabase();
    console.log(
      "Conexión a la base de datos de test cerrada y usuarios/servicios limpiados."
    );
  }, 10000); // Timeout para la desconexión

  // --- Test 1: Actualización Exitosa de un Servicio ---
  test("should update an existing service successfully", async () => {
    const updatesData = {
      name: "Servicio Actualizado " + Date.now(),
      shortDescription: "Nueva descripción corta",
      details: ["Detalle actualizado A", "Detalle actualizado B"],
    };

    const updatedService = await updateService(
      updatesData,
      adminId,
      testServiceId
    );

    expect(updatedService).toBeDefined();
    expect(updatedService._id.toString()).toBe(testServiceId.toString());
    expect(updatedService.name).toBe(updatesData.name);
    expect(updatedService.shortDescription).toBe(updatesData.shortDescription);
    expect(updatedService.details).toEqual(
      expect.arrayContaining(updatesData.details)
    );

    // Verificar que los cambios se hayan guardado en la DB
    const serviceInDb = await Service.findById(testServiceId);
    expect(serviceInDb).toBeDefined();
    expect(serviceInDb.name).toBe(updatesData.name);
    expect(serviceInDb.shortDescription).toBe(updatesData.shortDescription);
    expect(serviceInDb.details).toEqual(
      expect.arrayContaining(updatesData.details)
    );
    expect(serviceInDb.fullDescription).toBe("Descripción inicial completa"); // Campo no actualizado debe permanecer igual
  }, 10000);

  // --- Test 2: Lanzar ValidateError por adminId inválido ---
  test("should throw ValidateError for invalid adminId format", async () => {
    const invalidAdminId = "invalid-id-format"; // ID con formato incorrecto
    const updatesData = { name: "Updated Name" };

    await expect(
      updateService(updatesData, invalidAdminId, testServiceId)
    ).rejects.toThrow(ValidateError);
  });

  // --- Test 3: Lanzar ValidateError por serviceId inválido ---
  test("should throw ValidateError for invalid serviceId format", async () => {
    const invalidServiceId = "another-invalid-id"; // ID con formato incorrecto
    const updatesData = { name: "Updated Name" };

    await expect(
      updateService(updatesData, adminId, invalidServiceId)
    ).rejects.toThrow(ValidateError);
  });

  // --- Test 4: Lanzar ValidateError por updatesData inválidos ---
  test("should throw ValidateError for invalid updatesData", async () => {
    const invalidUpdatesData = { name: "", category: "invalid-cat" }; // Nombre vacío y categoría inválida
    // Asumimos que validateAndFilterUpdates o el esquema de Mongoose rechazará esto.
    // Si validateAndFilterUpdates es un mock, asegúrate de que el mock lance el error correcto aquí.
    await expect(
      updateService(invalidUpdatesData, adminId, testServiceId)
    ).rejects.toThrow(ValidateError);
  });

  // --- Test 5: Lanzar AuthorizationError si adminId no existe ---
  test("should throw AuthorizationError if adminId is not found", async () => {
    const nonExistentAdminId = new Types.ObjectId().toString(); // Genera un ID que no existe

    const updatesData = { name: "Name to Update" };

    await expect(
      updateService(updatesData, nonExistentAdminId, testServiceId)
    ).rejects.toThrow(AuthorizationError);
    await expect(
      updateService(updatesData, nonExistentAdminId, testServiceId)
    ).rejects.toThrow("Unauthorized"); // Verifica el mensaje específico si es posible
  });

  // --- Test 6: Lanzar NotFoundError si serviceId no existe ---
  test("should throw NotFoundError if service is not found", async () => {
    const nonExistentServiceId = new Types.ObjectId().toString(); // Genera un ID que no existe

    const updatesData = { name: "Name to Update" };

    await expect(
      updateService(updatesData, adminId, nonExistentServiceId)
    ).rejects.toThrow(NotFoundError);
    await expect(
      updateService(updatesData, adminId, nonExistentServiceId)
    ).rejects.toThrow("Service not found"); // Verifica el mensaje específico
  });

  // --- Test 7: Lanzar SystemError por error de base de datos (Ejemplo, requiere mocking avanzado) ---
  // Este test es más complejo de implementar sin mockear directamente Mongoose o su conexión.
  // Aquí es donde harías un mock para simular que Service.findByIdAndUpdate falla por un error de DB.
  // Ejemplo conceptual:
  // test("should throw SystemError on database update failure", async () => {
  //   const mockService = jest.spyOn(Service, 'findByIdAndUpdate');
  //   mockService.mockImplementationOnce(() => {
  //     throw new Error("Simulated database error during update");
  //   });

  //   const updatesData = { name: "Will Fail" };
  //   await expect(updateService(updatesData, adminId, testServiceId)).rejects.toThrow(SystemError);
  //   mockService.mockRestore(); // Limpiar el mock
  // });
});
