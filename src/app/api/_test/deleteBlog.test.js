import mongoose from "mongoose";
import { deleteBlog } from "@/app/api/_logic/index.js"; // Asegúrate de que la ruta a deleteBlog sea correcta
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "@/lib/db/connection.js"; // Tu función de conexión a la DB
import { Blog, User } from "@/lib/db/models/index.js"; // Tus modelos reales de Mongoose
import { errors, validate } from "shared"; // 'errors' y 'validate' de tu módulo 'shared'
import { slugify } from "@/lib/utils/slugify.js"; // Necesario para generar el slug en createTestBlog

const { NotFoundError, ValidateError, SystemError, AuthorizationError } =
  errors; // Asegúrate de importar todos los errores que puedan ser lanzados
const { Types } = mongoose; // Para generar ObjectIds falsos

// --- Funciones auxiliares para la gestión de la base de datos de prueba ---

/**
 * Limpia las colecciones de blogs y usuarios en la base de datos de prueba.
 */
const clearCollections = async () => {
  await Blog.deleteMany({}); // Cambiado de Service a Blog
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
 * Crea una entrada de blog de prueba en la base de datos con datos válidos por defecto.
 *
 * @param {string} authorId - El ObjectId del usuario autor del blog (campo obligatorio).
 * @param {object} blogData - Objeto con datos opcionales para sobrescribir los valores por defecto.
 * @returns {Promise<Blog>} El documento del blog creado.
 */
const createTestBlog = async (authorId, blogData = {}) => {
  // Generar un título único si no se proporciona
  const title = blogData.title || `Título de Blog de Prueba ${Date.now()}`;

  // El slug se generará automáticamente en el pre-validate hook del modelo
  // por lo que no es necesario generarlo aquí explícitamente a menos que
  // quieras sobrescribir el comportamiento del hook con un slug personalizado.
  // Si deseas generar el slug aquí ANTES de pasarlo al modelo:
  const slug = blogData.slug || slugify(title, { lower: true, strict: true });

  const blog = await Blog.create({
    title: title, // Campo 'title' del esquema de Blog
    slug: slug, // Campo 'slug' del esquema de Blog (se genera o se usa el proporcionado)
    content:
      blogData.content ||
      "Este es el contenido de prueba del blog. Debe ser lo suficientemente largo y relevante.", // Campo 'content'
    author: authorId, // Campo 'author' (ObjectId del usuario)
    category: blogData.category || "noticias-generales", // Campo 'category' (uno de los enum válidos)
    iconUrl:
      blogData.iconUrl || "https://via.placeholder.com/64x64?text=BlogIcon", // Campo 'iconUrl' (opcional, con default)
    // No incluir 'name', 'type', 'shortDescription', 'fullDescription', 'details'
    // ya que pertenecen al esquema de Servicio, no al de Blog.
  });
  return blog;
};

// --- Test Suite para deleteBlog ---
describe("deleteBlog - Tests de Lógica de Eliminación de Blog", () => {
  // Cambiado de deleteService a deleteBlog
  let adminId; // ID del usuario administrador de prueba

  // Conectar a la base de datos y crear un usuario administrador antes de todas las pruebas
  beforeAll(async () => {
    // Es crucial que 'process.env.DATABASE_URL' apunte a tu DB de TEST.
    await connectToDatabase(
      process.env.DATABASE_URL,
      process.env.DATABASE_NAME
    );
    console.log(
      "Conexión a la base de datos de test establecida para deleteBlog tests." // Cambiado el mensaje
    );

    // Limpiar completamente la base de datos antes de empezar los tests
    await clearCollections();

    // Crear un usuario administrador de prueba para todas las pruebas
    const adminUser = await createTestAdmin();
    adminId = adminUser._id.toString();
    console.log(`Usuario administrador de prueba creado con ID: ${adminId}`);
  }, 20000); // Aumenta el timeout para la configuración inicial de la DB

  // Limpiar las colecciones antes de CADA prueba
  // Esto asegura que cada test se ejecute en un estado aislado y predecible.
  beforeEach(async () => {
    await clearCollections(); // Limpiar colecciones antes de cada test
    console.log("Colecciones limpiadas antes de cada test.");
  });

  // Desconectar de la base de datos y limpiar usuarios/blogs después de todas las pruebas
  afterAll(async () => {
    await clearCollections(); // Limpiar la base de datos después de todos los tests
    await disconnectFromDatabase();
    console.log(
      "Conexión a la base de datos de test cerrada y datos limpiados."
    );
  }, 10000); // Timeout para la limpieza final

  //### Casos de Prueba

  test("should delete an existing blog successfully", async () => {
    // Cambiado el mensaje
    // Organizar: Crear un blog que será eliminado en este test
    const blogToDelete = await createTestBlog(adminId); // createTestBlog ahora requiere authorId
    const blogId = blogToDelete._id.toString(); // Cambiado de serviceId a blogId

    // Actuar: Llamar a la función deleteBlog
    await deleteBlog(adminId, blogId); // Cambiado de deleteService a deleteBlog

    // Afirmar: Verificar que el blog fue realmente eliminado de la base de datos
    const deletedBlogInDb = await Blog.findById(blogId); // Cambiado de Service.findById a Blog.findById
    expect(deletedBlogInDb).toBeNull(); // Esperamos que el blog ya no exista
  }, 10000);

  test("should throw NotFoundError if blog is not found after valid ID format", async () => {
    // Cambiado el mensaje
    // Organizar: Crear un ID con formato válido pero que sabemos que no existe en la DB
    const nonExistentBlogId = new Types.ObjectId().toString(); // Cambiado de nonExistentServiceId a nonExistentBlogId

    // Actuar y Afirmar: Esperar que se lance un NotFoundError
    await expect(deleteBlog(adminId, nonExistentBlogId)).rejects.toThrow(
      // Cambiado de deleteService a deleteBlog
      NotFoundError
    );
    await expect(deleteBlog(adminId, nonExistentBlogId)).rejects.toThrow(
      // Cambiado de deleteService a deleteBlog
      "Blog not found" // Cambiado de "Service not found" a "blog not found"
    );
  }, 10000);

  test("should throw ValidateError for invalid adminId format", async () => {
    // Organizar: Un ID de administrador con formato inválido
    const invalidAdminId = "invalid-id-format"; // ID con formato incorrecto
    const blogId = new Types.ObjectId().toString(); // Usar un ID de blog válido para el formato (cambiado de serviceId a blogId)

    // Actuar y Afirmar: Esperar que se lance un ValidateError debido al formato inválido del ID
    await expect(deleteBlog(invalidAdminId, blogId)).rejects.toThrow(
      // Cambiado de deleteService a deleteBlog
      ValidateError
    );
    // Verificar el mensaje específico que tu `validateId` lanza para ID inválido
    await expect(deleteBlog(invalidAdminId, blogId)).rejects.toThrow(
      // Cambiado de deleteService a deleteBlog
      "Validation failed for user ID" // Asumiendo este mensaje más genérico de validateId
    );
  }, 10000);

  test("should throw ValidateError for invalid blogId format", async () => {
    // Cambiado el mensaje
    // Organizar: Un ID de blog con formato inválido
    const invalidBlogId = "another-invalid-id"; // Cambiado de invalidServiceId a invalidBlogId
    const adminIdForTest = adminId; // Usar un ID de administrador válido

    // Actuar y Afirmar: Esperar que se lance un ValidateError debido al formato inválido del ID
    await expect(
      deleteBlog(adminIdForTest, invalidBlogId) // Cambiado de deleteService a deleteBlog
    ).rejects.toThrow(ValidateError);
    // Verificar el mensaje específico que tu `validateId` lanza para ID inválido
    await expect(
      deleteBlog(adminIdForTest, invalidBlogId) // Cambiado de deleteService a deleteBlog
    ).rejects.toThrow("Validation failed for user ID"); // Asumiendo este mensaje más genérico de validateId
  }, 10000);

  test("should throw SystemError for unexpected database error (simulated)", async () => {
    const errorMessage = "Simulated DB connection error";
    const blogId = new Types.ObjectId().toString(); // Un ID válido para el formato (cambiado de serviceId a blogId)

    // Guardar el método original para restaurarlo después
    const originalFindByIdAndDelete = Blog.findByIdAndDelete; // Cambiado de Service a Blog
    // Sobrescribir temporalmente el método para que lance un error genérico
    Blog.findByIdAndDelete = jest // Cambiado de Service a Blog
      .fn()
      .mockRejectedValue(new Error(errorMessage));

    // Actuar y Afirmar
    await expect(deleteBlog(adminId, blogId)).rejects.toThrow(
      // Cambiado de deleteService a deleteBlog
      SystemError
    );
    await expect(deleteBlog(adminId, blogId)).rejects.toThrow(
      // Cambiado de deleteService a deleteBlog
      `Error deleting Blog: ${errorMessage}` // Cambiado el mensaje
    );

    // Limpiar: Restaurar el método original del modelo
    Blog.findByIdAndDelete = originalFindByIdAndDelete; // Cambiado de Service a Blog
  }, 10000);

  test("should throw NotFoundError if Mongoose CastError occurs for blogId", async () => {
    // Cambiado el mensaje
    const invalidCastId = "aaaaaaaaaaaaaaaaaaaaaaaa"; // 24 caracteres, pero posiblemente no un ObjectId válido para Mongoose

    // Mockear la función validateId para que no lance un error, permitiendo que Mongoose genere el CastError
    const originalValidateId = validate.validateId;
    validate.validateId = jest.fn(); // Mockea validateId para que no falle en formato

    // Simular que findByIdAndDelete lanza un CastError de Mongoose
    const originalFindByIdAndDelete = Blog.findByIdAndDelete; // Cambiado de Service a Blog
    const castError = new mongoose.Error.CastError(
      "ObjectId",
      invalidCastId,
      "_id"
    );
    Blog.findByIdAndDelete = jest.fn().mockRejectedValue(castError); // Cambiado de Service a Blog

    // Actuar y Afirmar
    await expect(deleteBlog(adminId, invalidCastId)).rejects.toThrow(
      // Cambiado de deleteService a deleteBlog
      NotFoundError
    );
    await expect(deleteBlog(adminId, invalidCastId)).rejects.toThrow(
      // Cambiado de deleteService a deleteBlog
      "Blog not found" // Cambiado de "Service not found" a "blog not found"
    );

    // Limpiar: Restaurar las funciones originales
    validate.validateId = originalValidateId;
    Blog.findByIdAndDelete = originalFindByIdAndDelete; // Cambiado de Service a Blog
  }, 10000);
});
