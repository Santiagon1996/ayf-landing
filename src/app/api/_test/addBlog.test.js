import mongoose from "mongoose";
import { addBlog } from "@/app/api/_logic/index.js"; // Asegúrate de que la ruta sea correcta a tu addBlog
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "@/lib/db/connection.js"; // Tu función de conexión a la DB
import { Blog, User } from "@/lib/db/models/index.js"; // Tus modelos reales de Mongoose

import { errors } from "shared"; // Tus errores personalizados

const { DuplicityError, ValidateError, SystemError, AuthorizationError } =
  errors;
const { Types } = mongoose; // Para generar ObjectIds

// --- Funciones auxiliares para la gestión de la base de datos de prueba ---

/**
 * Limpia las colecciones de usuarios y blogs en la base de datos de prueba.
 */
const clearCollections = async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});
};

/**
 * Crea un usuario administrador de prueba en la base de datos.
 * @param {object} userData - Datos opcionales para el usuario.
 * @returns {Promise<User>} El documento del usuario creado.
 */
const createTestAdmin = async (userData = {}) => {
  // Asegúrate de que tu modelo User maneje hashear la contraseña
  const admin = await User.create({
    name: userData.name || "TestBlogAdmin",
    email: userData.email || `testblogadmin${Date.now()}@example.com`,
    password: userData.password || "secureblogpassword",
    role: "admin",
  });
  return admin;
};

// --- Test Suite para addBlog ---
describe("addBlog - Tests de Lógica de Creación de Blogs", () => {
  let adminId; // Aquí guardaremos el ID del usuario administrador creado

  // Conectar a la base de datos y crear un usuario administrador antes de todos los tests
  beforeAll(async () => {
    await connectToDatabase(
      process.env.DATABASE_URL,
      process.env.DATABASE_NAME
    );
    console.log(
      "Conexión a la base de datos de test establecida para addBlog tests."
    );

    // Limpiar completamente la base de datos antes de empezar los tests
    await clearCollections();

    // *** Crear un usuario administrador de prueba ***
    const adminUser = await createTestAdmin();
    adminId = adminUser._id.toString(); // Guarda el ID del usuario creado como string
    console.log(`Usuario administrador de prueba creado con ID: ${adminId}`);
  }, 20000); // Aumenta el timeout para la configuración inicial de la DB

  // Limpiar la colección de blogs y restaurar mocks después de cada prueba
  afterEach(async () => {
    await Blog.deleteMany({});
    console.log("Colección de blogs limpiada después del test.");
    jest.restoreAllMocks(); // <--- ¡LA CLAVE AQUÍ! Restaura todos los mocks de Jest después de cada test.
  });

  // Desconectar de la base de datos y limpiar el usuario administrador y los blogs después de que todas las pruebas hayan terminado
  afterAll(async () => {
    await clearCollections(); // Limpia todos los blogs y usuarios (incluido el admin)
    await disconnectFromDatabase();
    console.log(
      "Conexión a la base de datos de test cerrada y usuarios/blogs limpiados."
    );
  }, 10000); // Timeout para la limpieza final

  // --- Test 1: Blog agregado exitoso ---
  test("should add a new blog successfully", async () => {
    const blogData = {
      title: "Mi Nueva Publicacion Exitosa " + Date.now(), // Usa un título único y con más de 5 caracteres
      category: "juridico",
      description:
        "Esta es una descripción corta para el nuevo blog de prueba exitoso, y es lo suficientemente larga para cumplir los requisitos.",
      content:
        "Aquí va el contenido completo de la publicación exitosa. Es largo y detallado para cumplir con el mínimo de 20 caracteres.",
      author: "Dr. Test Blog",
      // iconUrl, publishedAt, isPublished, viewsCount tendrán valores por defecto de Mongoose/Zod
    };

    // Pasa el adminId REAL obtenido de la base de datos
    const result = await addBlog(blogData, adminId);

    // Aserciones sobre el resultado devuelto por addBlog
    expect(result).toBeDefined();
    expect(result.title).toBe(blogData.title);
    expect(result.category).toBe(blogData.category);
    expect(result.description).toBe(blogData.description);
    expect(result.content).toBe(blogData.content);
    expect(result.author).toBe(blogData.author);
    expect(result.slug).toBeDefined(); // El slug debería haberse generado
    expect(result.isPublished).toBe(false); // Valor por defecto

    // Verificar que el blog se haya guardado correctamente en la DB
    const blogInDb = await Blog.findById(result._id);
    expect(blogInDb).toBeDefined();
    expect(blogInDb.title).toBe(blogData.title);
    expect(blogInDb.slug).toBe(
      blogData.title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "")
    ); // Verifica el slug generado
    expect(blogInDb.category).toBe(blogData.category);
    expect(blogInDb.isPublished).toBe(false); // Valor por defecto
  }, 15000); // Aumenta el timeout si la DB tarda

  // --- Test 2: Blog duplicado (por título o slug) ---
  test("should throw DuplicityError if blog with same title or slug already exists", async () => {
    const blogData = {
      title: "Publicación Duplicada para Test " + Date.now(), // Asegúrate de min 5
      category: "contable",
      description: "Descripción de blog duplicado y lo suficientemente larga.",
      content:
        "Contenido de blog duplicado para el test y es lo suficientemente largo para cumplir.",
      author: "Tester",
    };

    // Primero, agrega el blog (esto ya genera el slug)
    await addBlog(blogData, adminId);

    // Luego, intenta agregarlo de nuevo con el mismo título
    await expect(addBlog(blogData, adminId)).rejects.toThrow(DuplicityError);
    await expect(addBlog(blogData, adminId)).rejects.toThrow(
      /Blog already exists/
    );
  }, 15000);

  // --- Test 3: Validación de datos incorrectos ---
  test("should throw ValidateError for invalid blog data", async () => {
    const invalidBlogData = {
      title: "C", // Título muy corto (menos de 5 caracteres)
      category: "categoria-invalida", // Categoría no válida
      description: "Corto", // Descripción que podría ser muy corta
      content: "Contenido corto", // Contenido muy corto (menos de 20 caracteres)
    };

    // Pasa el adminId real
    await expect(addBlog(invalidBlogData, adminId)).rejects.toThrow(
      ValidateError
    );
    await expect(addBlog(invalidBlogData, adminId)).rejects.toThrow(
      /Validation failed for blog post data/
    );
  }, 10000);

  // --- Test 4: Lanzar AuthorizationError si adminId no encontrado ---
  test("should throw AuthorizationError if adminId is not found", async () => {
    // Genera un ID que sabes que NO existe en la DB
    const nonExistentAdminId = new Types.ObjectId().toString();

    const blogData = {
      title: "Blog No Autorizado para Test " + Date.now(), // Asegúrate de min 5
      category: "noticias-generales",
      description:
        "Descripción para test de autorización y lo suficientemente larga.",
      content:
        "Contenido para test de autorización y es lo suficientemente largo.",
      author: "Inválido",
    };

    await expect(addBlog(blogData, nonExistentAdminId)).rejects.toThrow(
      AuthorizationError
    );
    await expect(addBlog(blogData, nonExistentAdminId)).rejects.toThrow(
      "Unauthorized"
    );
  }, 10000);

  // --- Test 5: Lanzar SystemError por error de base de datos (simulado) ---
  test("should throw SystemError on unexpected database creation failure (simulated)", async () => {
    const blogData = {
      title: "Blog con Error DB Simulado " + Date.now(), // Asegúrate de min 5
      category: "fiscal",
      description:
        "Descripción para test de error DB y lo suficientemente larga.",
      content: "Contenido para test de error DB y es lo suficientemente largo.",
      author: "ErrorSimulator",
    };

    // Usar jest.spyOn para mockear Blog.create de forma segura
    const blogCreateSpy = jest.spyOn(Blog, "create");
    blogCreateSpy.mockRejectedValue(new Error("Simulated DB connection issue")); // Sobrescribir con un mock que falla

    await expect(addBlog(blogData, adminId)).rejects.toThrow(SystemError);
    await expect(addBlog(blogData, adminId)).rejects.toThrow(
      "Error creating blog post"
    );

    // No necesitamos restaurar aquí explícitamente, ya lo hace jest.restoreAllMocks() en afterEach
    // blogCreateSpy.mockRestore(); // Esto es redundante si usas jest.restoreAllMocks()
  }, 10000);
});
