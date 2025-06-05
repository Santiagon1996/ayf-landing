// Importa las funciones y modelos utilizando los alias @/
import { registerUser } from "@/app/api/_logic/registerUser.js";
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "@/lib/db/connection.js";
import { User } from "@/lib/db/models/index.js";
import { errors } from "shared";
// import { z } from "zod";

const { DuplicityError, ValidateError, SystemError } = errors;

describe("registerUser - Happy Path", () => {
  // Conectar a la base de datos antes de que se ejecuten todos los tests en esta suite
  beforeAll(async () => {
    // Asegúrate de que process.env.DATABASE_URL y process.env.DATABASE_NAME
    // estén configurados para tu base de datos de test (ej. 'juridico-contable-test')
    await connectToDatabase(
      process.env.DATABASE_URL,
      process.env.DATABASE_NAME
    );
    console.log(
      "Conexión a la base de datos de test establecida para registerUser tests."
    );
  });

  // Limpiar la colección de usuarios después de cada prueba
  // Esto asegura que cada prueba sea independiente y empiece con un estado limpio
  afterEach(async () => {
    await User.deleteMany({});
    console.log("Colección de usuarios limpiada después del test.");
  });

  // Desconectar de la base de datos después de que todas las pruebas hayan terminado
  afterAll(async () => {
    await disconnectFromDatabase();
    console.log(
      "Conexión a la base de datos de test cerrada después de todos los tests."
    );
  });

  // --- Test 1: Registro exitoso ---
  test("should register a new user successfully", async () => {
    const userData = {
      name: "Admin",
      email: "admin@admin.com",
      password: "123123123",
    };

    const result = await registerUser(userData);

    // Aserciones Jest
    expect(result).toBeDefined();
    expect(result.name).toBe(userData.name.toLowerCase()); // Verifica que el nombre esté en minúsculas
    expect(result.email).toBe(userData.email);
    // Asegúrate de que la contraseña esté hasheada (no es igual a la original)
    expect(result.password).not.toBe(userData.password);
    expect(result.id).toBeDefined(); // El ID debe ser generado por la DB

    // Verificar que el usuario se haya guardado en la DB y el nombre en minúsculas
    const userInDb = await User.findById(result.id); // Usar el ID devuelto
    expect(userInDb).toBeDefined();
    expect(userInDb.email).toBe(userData.email);
    expect(userInDb.name).toBe(userData.name.toLowerCase()); // Espera minúsculas en DB
  }, 15000); // Aumenta el timeout a 15 segundos por si la DB tarda

  //-- Test 2: Usuario ya existe ---

  test("should throw DuplicityError if user already exists", async () => {
    const existingUserData = {
      name: "Admin",
      email: "admin@admin.com",
      password: "123123123",
    };
    // Primero, registramos un usuario
    await registerUser(existingUserData);

    // Luego, intenta registrarlo de nuevo y espera que lance un error de duplicidad
    await expect(registerUser(existingUserData)).rejects.toThrow(
      DuplicityError
    );
    await expect(registerUser(existingUserData)).rejects.toThrow(
      "User already exists with this email"
    );
  }, 15000);

  // --- Test 3: Validación de datos ---
  test("should throw validation error if user data is invalid", async () => {
    const invalidUserData = {
      name: "Admin",
      email: "invalid-email", // Email inválido
      password: "123", // Contraseña demasiado corta
    };

    await expect(registerUser(invalidUserData)).rejects.toThrow(ValidateError);
    await expect(registerUser(invalidUserData)).rejects.toThrow(
      "Validation failed for user registration"
    );
  }, 15000);

  // --- Tests para validaciones de Zod (ValidateError) ---

  test("should throw a ValidateError for invalid name (too short)", async () => {
    const invalidUserData = {
      name: "ab", // Menos de 3 caracteres
      email: "invalid.name@example.com",
      password: "password123",
    };
    await expect(registerUser(invalidUserData)).rejects.toThrow(ValidateError);
    await expect(registerUser(invalidUserData)).rejects.toThrow(
      "Validation failed for user registration"
    );
    // Puedes inspeccionar los detalles del error si capturas la promesa
    const error = await registerUser(invalidUserData).catch((e) => e);
    expect(error.details[0].message).toBe(
      "El nombre debe tener al menos 3 caracteres"
    );
  }, 15000);

  test("should throw a ValidateError for invalid name (too long)", async () => {
    const invalidUserData = {
      name: "a".repeat(51), // Más de 50 caracteres
      email: "long.name@example.com",
      password: "password123",
    };
    await expect(registerUser(invalidUserData)).rejects.toThrow(ValidateError);
    await expect(registerUser(invalidUserData)).rejects.toThrow(
      "Validation failed for user registration"
    );
    const error = await registerUser(invalidUserData).catch((e) => e);
    expect(error.details[0].message).toBe(
      "El nombre no puede superar los 50 caracteres"
    );
  }, 15000);

  test("should throw a ValidateError for invalid name (invalid characters)", async () => {
    const invalidUserData = {
      name: "Name123", // Contiene números, falla regex
      email: "invalid.char.name@example.com",
      password: "password123",
    };
    await expect(registerUser(invalidUserData)).rejects.toThrow(ValidateError);
    await expect(registerUser(invalidUserData)).rejects.toThrow(
      "Validation failed for user registration"
    );
    const error = await registerUser(invalidUserData).catch((e) => e);
    expect(error.details[0].message).toBe(
      "El nombre solo puede contener letras y espacios"
    );
  }, 15000);

  test("should throw a ValidateError for invalid email format", async () => {
    const invalidUserData = {
      name: "Valid Name",
      email: "invalid-email-format", // Email inválido
      password: "password123",
    };
    await expect(registerUser(invalidUserData)).rejects.toThrow(ValidateError);
    await expect(registerUser(invalidUserData)).rejects.toThrow(
      "Validation failed for user registration"
    );
    const error = await registerUser(invalidUserData).catch((e) => e);
    expect(error.details[0].message).toBe("Email inválido");
  }, 15000);

  test("should throw a ValidateError for email too long", async () => {
    const invalidUserData = {
      name: "Valid Name",
      email: "a".repeat(45) + "@example.com", // 45 + 10 = 55 caracteres, falla Zod (max 50)
      password: "password123",
    };
    await expect(registerUser(invalidUserData)).rejects.toThrow(ValidateError);
    await expect(registerUser(invalidUserData)).rejects.toThrow(
      "Validation failed for user registration"
    );
    const error = await registerUser(invalidUserData).catch((e) => e);
    expect(error.details[0].message).toBe(
      "El email no puede superar los 50 caracteres"
    );
  }, 15000);

  test("should throw a ValidateError for password too short (Zod min 6)", async () => {
    const invalidUserData = {
      name: "Valid Name",
      email: "short.password.zod@example.com",
      password: "12345", // 5 caracteres, falla Zod (min 6)
    };
    await expect(registerUser(invalidUserData)).rejects.toThrow(ValidateError);
    await expect(registerUser(invalidUserData)).rejects.toThrow(
      "Validation failed for user registration"
    );
    const error = await registerUser(invalidUserData).catch((e) => e);
    expect(error.details[0].message).toBe(
      "La contraseña debe tener al menos 6 caracteres"
    );
  }, 15000);

  test("should throw a ValidateError for password too long (Zod max 50)", async () => {
    const invalidUserData = {
      name: "Valid Name",
      email: "long.password.zod@example.com",
      password: "a".repeat(51), // 51 caracteres, falla Zod (max 50)
    };
    await expect(registerUser(invalidUserData)).rejects.toThrow(ValidateError);
    await expect(registerUser(invalidUserData)).rejects.toThrow(
      "Validation failed for user registration"
    );
    const error = await registerUser(invalidUserData).catch((e) => e);
    expect(error.details[0].message).toBe(
      "La contraseña no puede superar los 50 caracteres"
    );
  }, 15000);

  test("should throw a ValidateError for missing required fields", async () => {
    const incompleteUserData = {
      name: "Incomplete",
      // email y password faltan
    };
    await expect(registerUser(incompleteUserData)).rejects.toThrow(
      ValidateError
    );
    await expect(registerUser(incompleteUserData)).rejects.toThrow(
      "Validation failed for user registration"
    );
    const error = await registerUser(incompleteUserData).catch((e) => e);
    // Esperamos múltiples errores de validación para campos faltantes
    expect(error.details.length).toBeGreaterThanOrEqual(2);
    expect(error.details.some((d) => d.field === "email")).toBe(true);
    expect(error.details.some((d) => d.field === "password")).toBe(true);
  }, 15000);

  // --- Tests para simular errores de base de datos (requieren mocking) ---

  test("should throw a SystemError if there is a DB error during existence check", async () => {
    // Mockear User.findOne para que lance un error de DB
    jest.spyOn(User, "findOne").mockImplementationOnce(() => {
      // Devolver una promesa rechazada explícitamente
      return Promise.reject(new Error("Simulated DB connection error"));
    });

    const userData = {
      name: "DB Error Test",
      email: "db.error@example.com",
      password: "password123",
    };
    try {
      await registerUser(userData);
      // Si no lanza error, el test falla
      throw new Error("Expected SystemError was not thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(SystemError);
      expect(error.message).toBe("Error checking user existence");
      expect(error.details).toBe("Simulated DB connection error");
    }
  }, 15000);

  test("should throw a SystemError if there is a DB error during user creation", async () => {
    // Para este test, findOne debe RESOLVER (no encontrar usuario) para que create sea llamado
    jest.spyOn(User, "findOne").mockResolvedValueOnce(null); // No encuentra usuario existente
    // Y luego, create debe RECHAZAR
    jest.spyOn(User, "create").mockImplementationOnce(() => {
      // Devolver una promesa rechazada explícitamente
      return Promise.reject(new Error("Simulated DB creation error"));
    });

    const userData = {
      name: "DB Create Error Test",
      email: "db.create.error@example.com",
      password: "password123",
    };

    try {
      await registerUser(userData);
      throw new Error("Expected SystemError was not thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(SystemError);
      expect(error.message).toBe("Error creating user");
      expect(error.details).toBe("Simulated DB creation error");
    }
  }, 15000);
});
