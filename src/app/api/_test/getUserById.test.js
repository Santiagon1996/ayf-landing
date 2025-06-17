// Importa la función a testear
import { getUserById } from "@/app/api/_logic/getUserById.js";
// Importa las clases de error y la validación
import { errors, validate } from "shared";
// Mockear el modelo User y sus métodos directamente al inicio
jest.mock("@/lib/db/models/index.js", () => ({
  User: {
    findById: jest.fn(),
  },
}));
// Mockear la función de validación de ID de usuario
jest.mock("shared", () => ({
  ...jest.requireActual("shared"), // Mantener las implementaciones reales de otras partes si existen
  validate: {
    ...jest.requireActual("shared").validate,
    validateUserId: jest.fn(), // Mockear solo validateUserId
  },
}));

// Importar el mock de User y validateUserId después de mockear
import { User } from "@/lib/db/models/index.js";
const { AuthorizationError, SystemError, ValidateError } = errors; // Asegúrate de importar ValidateError
const { validateUserId } = validate;

describe("getUserById Logic", () => {
  const testUser = {
    _id: "654321098765432109876543", // ID de usuario de prueba
    name: "Test User",
    email: "test@example.com",
    password: "hashedpassword", // Este dato no debería ser devuelto
    role: "admin",
    toObject: jest.fn(function () {
      return { ...this };
    }), // Simula el método toObject de Mongoose
  };

  // Limpiar todos los mocks antes de cada test
  beforeEach(() => {
    jest.clearAllMocks();
    // Resetear las implementaciones de los mocks a sus valores por defecto
    User.findById.mockReset();
    validateUserId.mockReset();
  });

  // --- Test 1: ID válido y usuario existente ---
  test("should return safe user data for a valid and existing ID", async () => {
    // Configurar el mock para que findById devuelva nuestro usuario de prueba
    User.findById.mockResolvedValueOnce(testUser);
    // Asegurarnos de que validateUserId no lance un error
    validateUserId.mockImplementation(() => {});

    const userId = testUser._id;
    const result = await getUserById(userId);

    // Verificaciones
    expect(validateUserId).toHaveBeenCalledWith(userId); // Asegura que la validación fue llamada
    expect(User.findById).toHaveBeenCalledWith(userId); // Asegura que findById fue llamado con el ID correcto
    expect(result).toBeDefined();
    expect(result._id).toBe(testUser._id);
    expect(result.name).toBe(testUser.name);
    expect(result.email).toBe(testUser.email);
    expect(result.role).toBe(testUser.role);
    expect(result.password).toBeUndefined(); // ¡Importante! La contraseña no debe ser devuelta
  });

  // --- Test 2: ID válido pero usuario no existente ---
  test("should throw an AuthorizationError if user ID is valid but user does not exist", async () => {
    // Configurar el mock para que findById devuelva null (usuario no encontrado)
    User.findById.mockResolvedValueOnce(null);
    // Asegurarnos de que validateUserId no lance un error
    validateUserId.mockImplementation(() => {});

    const userId = "654321098765432109876544"; // Otro ID válido que no existe

    await expect(getUserById(userId)).rejects.toThrow(AuthorizationError);
    await expect(getUserById(userId)).rejects.toThrow(
      "Authenticated user not found in the database."
    );
    expect(validateUserId).toHaveBeenCalledWith(userId);
    expect(User.findById).toHaveBeenCalledWith(userId);
  });

  // --- Test 3: ID de usuario inválido (formato incorrecto) ---
  test("should throw a ValidateError for an invalid user ID format", async () => {
    const invalidUserId = "invalid-id-format";
    // Configurar validateUserId para que lance un ValidateError
    validateUserId.mockImplementation(() => {
      throw new ValidateError("Invalid ID format", [
        { field: "userId", message: "ID is not a valid ObjectId" },
      ]);
    });

    await expect(getUserById(invalidUserId)).rejects.toThrow(ValidateError);
    await expect(getUserById(invalidUserId)).rejects.toThrow(
      "Invalid ID format"
    );
    expect(validateUserId).toHaveBeenCalledWith(invalidUserId);
    expect(User.findById).not.toHaveBeenCalled(); // No debería llamar a findById si la validación falla
  });

  // --- Test 4: ID de usuario nulo o indefinido ---
  test("should throw an AuthorizationError if user ID is null or undefined", async () => {
    // No necesitamos mockear validateUserId porque el check inicial lo atrapa
    await expect(getUserById(null)).rejects.toThrow(AuthorizationError);
    await expect(getUserById(null)).rejects.toThrow(
      "User ID is required to fetch user data."
    );

    await expect(getUserById(undefined)).rejects.toThrow(AuthorizationError);
    await expect(getUserById(undefined)).rejects.toThrow(
      "User ID is required to fetch user data."
    );

    expect(validateUserId).not.toHaveBeenCalled(); // No debería llegar a la validación
    expect(User.findById).not.toHaveBeenCalled(); // Ni a findById
  });

  // --- Test 5: Error del sistema al consultar la base de datos ---
  test("should throw a SystemError if there is a database error during user fetch", async () => {
    const userId = testUser._id;
    const dbErrorMessage = "Simulated DB lookup error"; // Use a specific message

    // Configurar el mock para que findById lance un error de DB
    User.findById.mockImplementationOnce(() => {
      // Return a Promise.reject directly, or throw an error synchronously within a Promise.reject
      // This ensures the rejection happens as expected
      return Promise.reject(new Error(dbErrorMessage));
    });

    validateUserId.mockImplementation(() => {}); // Ensure validation passes

    let caughtError;
    try {
      await getUserById(userId);
    } catch (error) {
      caughtError = error;
    }

    // Now, explicitly check the caught error
    expect(caughtError).toBeInstanceOf(SystemError);
    expect(caughtError.message).toBe(
      "Error fetching user data from database by ID."
    );
    // Optionally check the original error message if it's part of the SystemError's internal message
    // expect(caughtError.originalError).toBe(dbErrorMessage); // If SystemError stores it this way

    expect(validateUserId).toHaveBeenCalledWith(userId);
    expect(User.findById).toHaveBeenCalledWith(userId);
  });
});
