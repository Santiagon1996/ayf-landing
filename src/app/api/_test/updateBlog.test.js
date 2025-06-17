import mongoose from "mongoose";
import { updateBlog } from "@/app/api/_logic/index.js"; // Ruta a tu lógica updateBlog
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "@/lib/db/connection.js"; // Tu función de conexión a la DB
import { Blog, User } from "@/lib/db/models/index.js"; // Tus modelos reales de Mongoose
import { errors, validate } from "shared"; // Tus errores personalizados y funciones de validación
import { validateAndFilterUpdates } from "@/lib/utils/validateAndFilterUpdates.js"; // Importa la implementación REAL
import { ensureAdminAuth } from "@/lib/utils/ensureAdminAuth.js"; // Importa la implementación REAL
import { slugify } from "@/lib/utils/slugify.js"; // Necesario si tu modelo Blog usa un pre-save hook para slugs

// Desestructuración de errores personalizados para facilitar las aserciones
const { SystemError, ValidateError, NotFoundError, AuthorizationError } =
  errors;
const { Types } = mongoose; // Para generar ObjectIds

// --- Funciones auxiliares para la gestión de la base de datos de prueba ---

/**
 * Limpia las colecciones de blogs y usuarios en la base de datos de prueba.
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
  const admin = await User.create({
    name: userData.name || "TestAdmin",
    email: userData.email || `testadmin${Date.now()}@example.com`,
    password: userData.password || "securepassword",
    role: "admin",
  });
  return admin;
};

/**
 * Crea una entrada de blog de prueba en la base de datos.
 * @param {string} authorId - El ID del autor del blog (Mongoose ObjectId).
 * @param {object} blogData - Datos del blog.
 * @returns {Promise<Blog>} El documento del blog creado.
 */
const createTestBlog = async (authorId, blogData = {}) => {
  // Genera un slug basado en el título si no se proporciona
  const title = blogData.title || `Test Blog ${Date.now()}`;
  const slug = blogData.slug || slugify(title, { lower: true, strict: true });

  const blog = await Blog.create({
    title: title,
    slug: slug,
    content:
      blogData.content ||
      "Contenido de prueba para el blog que tiene al menos 10 caracteres y es lo suficientemente largo.",
    author: authorId,
    category: blogData.category || "noticias-generales",
  });
  return blog;
};

// --- Test Suite para updateBlog ---
describe("updateBlog - Tests de Lógica de Actualización de Blogs (Integración)", () => {
  let adminUser; // Objeto de usuario administrador
  let adminId; // ID del usuario administrador
  let testBlog; // Objeto de blog de prueba (para resetear entre tests)
  let blogId; // ID del blog de prueba

  // Conectar a la DB y crear datos iniciales antes de todas las pruebas
  beforeAll(async () => {
    await connectToDatabase(
      process.env.DATABASE_URL,
      process.env.DATABASE_NAME
    );
    console.log(
      "Conexión a la base de datos de test establecida para updateBlog (Integración) tests."
    );

    await clearCollections(); // Limpiar colecciones antes de empezar

    adminUser = await createTestAdmin();
    adminId = adminUser._id.toString();
    console.log(`Usuario administrador de prueba creado con ID: ${adminId}`);
  }, 20000); // Aumenta el timeout para la configuración inicial

  // Antes de cada test, crea un nuevo blog o resetea el existente para un estado limpio
  beforeEach(async () => {
    await Blog.deleteMany({}); // Limpia los blogs de tests anteriores
    testBlog = await createTestBlog(adminUser._id, {
      title: "Blog Inicial para Actualizar " + Date.now(),
      content:
        "Este es el contenido original del blog de prueba, lo suficientemente largo para ser válido.",
      category: "juridico", // Asegurarse de que el blog inicial tenga una categoría válida
    });
    blogId = testBlog._id.toString();
    console.log(`Blog de prueba reinicializado con ID: ${blogId}`);
  });

  // Limpiar colecciones y restaurar mocks (aunque en integración es menos común)
  afterEach(async () => {
    jest.restoreAllMocks();
    console.log("Limpieza después de cada test de integración.");
  });

  // Desconectar de la DB y limpiar todo después de todas las pruebas
  afterAll(async () => {
    await clearCollections(); // Limpiar todo al final
    await disconnectFromDatabase();
    console.log(
      "Conexión a la base de datos de test cerrada y usuarios/blogs limpiados."
    );
  }, 10000);

  // --- Test 1: Actualización exitosa de un blog ---
  test("should update an existing blog successfully", async () => {
    const updates = {
      title: "Título Actualizado del Blog Exitoso " + Date.now(),
      content:
        "Nuevo contenido para el test de actualización exitosa. Es largo y detallado.",
      category: "fiscal", // Proporcionar una categoría válida para la actualización
      iconUrl: "https://ejemplo.com/new_valid_icon.png", // Asume que iconUrl es válido y opcional
    };

    const updatedBlog = await updateBlog(updates, adminId, blogId);

    // Assertions
    expect(updatedBlog).toBeDefined();
    expect(updatedBlog._id.toString()).toBe(blogId);
    expect(updatedBlog.title).toBe(updates.title);
    expect(updatedBlog.content).toBe(updates.content);
    expect(updatedBlog.category).toBe(updates.category); // Afirmar la categoría
    expect(updatedBlog.slug).toBe(
      slugify(updates.title, { lower: true, strict: true })
    );

    // Verify the update in the database
    const blogInDb = await Blog.findById(blogId);
    expect(blogInDb).toBeDefined();
    expect(blogInDb.title).toBe(updates.title);
    expect(blogInDb.content).toBe(updates.content);
    expect(blogInDb.category).toBe(updates.category); // Verificar en DB
  }, 15000);

  // --- Test 2: `ValidateError` para datos de actualización inválidos ---
  test("should throw ValidateError for invalid updatesData", async () => {
    const invalidUpdatesData = {
      title: "Sh", // Menos de 3 caracteres
      content: "", // Contenido vacío (si es requerido y no permite vacío)
      category: "categoria-invalida", // Categoría no válida
      badField: "Esto no debería estar aquí", // Un campo no definido en el esquema
    };

    await expect(
      updateBlog(invalidUpdatesData, adminId, blogId)
    ).rejects.toThrow(ValidateError);
    await expect(
      updateBlog(invalidUpdatesData, adminId, blogId)
    ).rejects.toThrow(/Validation failed for blog updates/);
  }, 10000);

  // --- Test 3: `AuthorizationError` si el adminId no es válido/no tiene permisos ---
  test("should throw AuthorizationError if adminId is not found or unauthorized", async () => {
    const nonExistentAdminId = new Types.ObjectId().toString();
    const updates = {
      title: "Título por usuario no autorizado " + Date.now(),
      category: "noticias-generales",
    }; // Datos válidos

    await expect(
      updateBlog(updates, nonExistentAdminId, blogId)
    ).rejects.toThrow(AuthorizationError);
    await expect(
      updateBlog(updates, nonExistentAdminId, blogId)
    ).rejects.toThrow("Unauthorized: Invalid or insufficient permissions.");
  }, 10000);

  // --- Test 4: `NotFoundError` si el blogId no existe ---
  test("should throw NotFoundError if blog is not found", async () => {
    const nonExistentBlogId = new Types.ObjectId().toString();
    const updates = {
      title: "Título para blog inexistente " + Date.now(),
      category: "laboral",
    }; // Datos válidos

    await expect(
      updateBlog(updates, adminId, nonExistentBlogId)
    ).rejects.toThrow(NotFoundError);
    await expect(
      updateBlog(updates, adminId, nonExistentBlogId)
    ).rejects.toThrow("blog not found");
  }, 10000);

  // --- Test 5: `ValidateError` si el formato de `adminId` o `blogId` es inválido ---
  test("should throw ValidateError for invalid ID format (adminId or blogId)", async () => {
    const invalidIdFormat = "12345";
    const updates = {
      title: "Test con ID inválido " + Date.now(),
      category: "juridico",
    };

    await expect(updateBlog(updates, invalidIdFormat, blogId)).rejects.toThrow(
      ValidateError
    );
    await expect(updateBlog(updates, invalidIdFormat, blogId)).rejects.toThrow(
      /Validation failed for user ID/
    );

    await expect(updateBlog(updates, adminId, invalidIdFormat)).rejects.toThrow(
      ValidateError
    );
    await expect(updateBlog(updates, adminId, invalidIdFormat)).rejects.toThrow(
      /Validation failed for user ID/
    );
  }, 10000);

  // --- Test 6: `SystemError` en caso de un fallo inesperado de la base de datos ---
  test("should throw SystemError on unexpected database update failure", async () => {
    const updates = {
      title: "Título para test de error DB " + Date.now(),
      category: "contable",
    };

    const findByIdAndUpdateSpy = jest.spyOn(Blog, "findByIdAndUpdate");
    findByIdAndUpdateSpy.mockRejectedValue(
      new Error("Simulated unexpected database connection error")
    );

    await expect(updateBlog(updates, adminId, blogId)).rejects.toThrow(
      SystemError
    );
    await expect(updateBlog(updates, adminId, blogId)).rejects.toThrow(
      "Error updating blog"
    );
  }, 10000);
});
