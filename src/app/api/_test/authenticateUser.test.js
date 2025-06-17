import { authenticateUser } from "@/app/api/_logic/authenticateUser.js";
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "@/lib/db/connection.js";
import { User } from "@/lib/db/models/index.js";
import { errors } from "shared";

// No necesitamos importar todas las clases de error para este test específico,
// pero las mantengo comentadas por si las necesitas en el futuro.
const { NotFoundError, SystemError, CredentialsError, ValidateError } = errors;

describe("authenticateUser Logic - Happy Path", () => {
  // Datos de usuario de prueba para crear en la DB antes de los tests
  const testUser = {
    name: "Auth Test User",
    email: "auth.test.success@example.com", // Usar un email único para este test
    password: "authpassword123", // 15 caracteres, cumple min 8 y max 20 de Mongoose y Zod
    role: "admin",
  };

  // Conectar a la base de datos antes de que se ejecuten todos los tests en esta suite
  beforeAll(async () => {
    await connectToDatabase(
      process.env.DATABASE_URL,
      process.env.DATABASE_NAME
    );
    console.log(
      "Conexión a la base de datos de test establecida para authenticateUser tests."
    );
  });

  // Antes de cada test, limpiar la colección de usuarios y crear un usuario de prueba
  beforeEach(async () => {
    await User.deleteMany({}); // Limpiar colección antes de cada test
    jest.restoreAllMocks(); // Restaura los mocks después de cada test

    // Crear el usuario de prueba directamente en la DB con la contraseña EN TEXTO PLANO.
    // El hasheo lo hará el middleware 'pre("save")' de Mongoose.
    await User.create({
      name: testUser.name,
      email: testUser.email,
      password: testUser.password, // <-- Pasar la contraseña en texto plano
      role: testUser.role,
    });
    console.log(
      "Usuario de prueba creado y mocks restaurados para cada test de authenticateUser."
    );
  });

  // Desconectar de la base de datos después de que todas las pruebas hayan terminado
  afterAll(async () => {
    await User.deleteMany({}); // Limpiar colección al final
    await disconnectFromDatabase();
    console.log(
      "Conexión a la base de datos de test cerrada para authenticateUser tests."
    );
  });

  // --- Test 1: Autenticación exitosa ---
  test("should authenticate user with correct credentials", async () => {
    const credentials = {
      name: testUser.name, // Tu lógica de autenticación usa 'name' para buscar
      password: testUser.password,
    };

    const authenticatedUser = await authenticateUser(credentials);

    // Aserciones Jest
    expect(authenticatedUser).toBeDefined();
    expect(authenticatedUser.name).toBe(testUser.name.toLowerCase()); // El nombre debería coincidir
    expect(authenticatedUser.role).toBe(testUser.role);
    expect(authenticatedUser.id).toBeDefined(); // El ID debe estar presente
    // Es crucial que la contraseña nunca se devuelva
    expect(authenticatedUser.password).toBeUndefined(); // La propiedad 'select: false' en el esquema de Mongoose debería asegurar esto
  }, 15000); // Aumenta el timeout si la DB tarda

  // --- Test 2: Usuario no existe (NotFoundError) ---
  test("should throw a NotFoundError if user does not exist", async () => {
    const credentials = {
      name: "nonexistent user", // Nombre de usuario que no existe
      password: "anypassword",
    };

    await expect(authenticateUser(credentials)).rejects.toThrow(NotFoundError);
    await expect(authenticateUser(credentials)).rejects.toThrow(
      "User not found with this name"
    ); // Mensaje exacto
  }, 15000);

  // --- Test 3: para validaciones de Zod (ValidateError) ---

  test("should throw a ValidateError for missing name", async () => {
    const invalidCredentials = {
      // name está ausente
      password: testUser.password,
    };

    await expect(authenticateUser(invalidCredentials)).rejects.toThrow(
      ValidateError
    );
    await expect(authenticateUser(invalidCredentials)).rejects.toThrow(
      "Validation failed for user login"
    );
    const error = await authenticateUser(invalidCredentials).catch((e) => e);

    expect(error.details.some((d) => d.field === "name")).toBe(true);
    expect(error.details.some((d) => d.message === "Required")).toBe(true);
  }, 15000);

  test("should throw a ValidateError for name too short", async () => {
    const invalidCredentials = {
      name: "ab", // Menos de 3 caracteres
      password: testUser.password,
    };

    await expect(authenticateUser(invalidCredentials)).rejects.toThrow(
      ValidateError
    );
    await expect(authenticateUser(invalidCredentials)).rejects.toThrow(
      "Validation failed for user login"
    );
    const error = await authenticateUser(invalidCredentials).catch((e) => e);
    expect(error.details[0].message).toBe(
      "El nombre debe tener al menos 3 caracteres"
    );
  }, 15000);

  test("should throw a ValidateError for password too short (Zod min 6)", async () => {
    const invalidCredentials = {
      name: testUser.name,
      password: "12345", // 5 caracteres, falla Zod (min 6)
    };

    await expect(authenticateUser(invalidCredentials)).rejects.toThrow(
      ValidateError
    );
    await expect(authenticateUser(invalidCredentials)).rejects.toThrow(
      "Validation failed for user login"
    );
    const error = await authenticateUser(invalidCredentials).catch((e) => e);
    expect(error.details[0].message).toBe(
      "La contraseña debe tener al menos 6 caracteres"
    );
  }, 15000);

  test("should throw a ValidateError for password too long (Zod max 50)", async () => {
    const invalidCredentials = {
      name: testUser.name,
      password: "a".repeat(51), // 51 caracteres, falla Zod (max 50)
    };

    await expect(authenticateUser(invalidCredentials)).rejects.toThrow(
      ValidateError
    );
    await expect(authenticateUser(invalidCredentials)).rejects.toThrow(
      "Validation failed for user login"
    );
    const error = await authenticateUser(invalidCredentials).catch((e) => e);
    expect(error.details[0].message).toBe(
      "La contraseña no puede superar los 50 caracteres"
    );
  }, 15000);

  // --- Test 4: Credenciales incorrectas (CredentialsError) ---
  test("should throw a CredentialsError for incorrect password", async () => {
    const credentials = {
      name: testUser.name,
      password: "wrongpassword", // Contraseña incorrecta
    };

    await expect(authenticateUser(credentials)).rejects.toThrow(
      CredentialsError
    );
    await expect(authenticateUser(credentials)).rejects.toThrow(
      "Invalid email or password"
    ); // Mensaje exacto
  }, 15000);

  // --- Tests para simular errores de base de datos (requieren mocking) ---

  test("should throw a SystemError if there is a DB error during user existence check", async () => {
    // Mockea toda la cadena findOne().select()
    jest.spyOn(User, "findOne").mockReturnValueOnce({
      select: () => Promise.reject(new Error("Simulated DB connection error")),
    });

    const credentials = {
      name: "DB Error Test",
      password: "password123",
    };

    try {
      await authenticateUser(credentials);
      throw new Error("Expected SystemError was not thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(SystemError);
      expect(error.message).toBe("Error checking user existence");
      expect(error.details.message).toBe("Simulated DB connection error");
    }
  }, 15000);

  test("should throw a SystemError if there is a DB error during password comparison", async () => {
    // Mockea findOne().select() para devolver un usuario simulado
    jest.spyOn(User, "findOne").mockReturnValueOnce({
      select: () =>
        Promise.resolve({
          _id: "fakeid",
          name: "DB Error Test",
          password: "hashedpassword",
          role: "user",
        }),
    });
    // Mockea bcrypt.compare para lanzar un error
    jest.spyOn(require("bcryptjs"), "compare").mockImplementationOnce(() => {
      return Promise.reject(new Error("Simulated bcrypt error"));
    });

    const credentials = {
      name: "DB Error Test",
      password: "password123",
    };

    try {
      await authenticateUser(credentials);
      throw new Error("Expected SystemError was not thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(SystemError);
      expect(error.message).toBe("Error comparing passwords");
      expect(error.details).toBe("Simulated bcrypt error");
    }
  }, 15000);
});
