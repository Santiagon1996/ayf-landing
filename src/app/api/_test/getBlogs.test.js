import mongoose from "mongoose";
import { getBlogs } from "@/app/api/_logic/index.js"; // Asegúrate de que la ruta a getBlogs sea correcta
import {
  connectToDatabase,
  disconnectFromDatabase,
} from "@/lib/db/connection.js"; // Tu función de conexión a la DB
import { Blog, User } from "@/lib/db/models/index.js"; // Tus modelos reales de Mongoose
import { errors } from "shared"; // 'errors' de tu módulo 'shared'
import { slugify } from "@/lib/utils/slugify.js"; // Necesario para generar el slug en createTestBlog

const { NotFoundError, SystemError } = errors;
const { Types } = mongoose; // Para generar ObjectIds falsos

// --- Funciones auxiliares para la gestión de la base de datos de prueba ---
// Reutilizamos estas funciones de tus otros tests para mantener la consistencia.

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
    name: userData.name || "TestAdminGet",
    email: userData.email || `testadmin.get.${Date.now()}@example.com`,
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
  const title = blogData.title || `Título de Blog de Prueba ${Date.now()}`;
  const slug = blogData.slug || slugify(title, { lower: true, strict: true });

  const blog = await Blog.create({
    title: title,
    slug: slug,
    content:
      blogData.content ||
      "Este es el contenido de prueba del blog. Debe ser lo suficientemente largo y relevante.",
    author: authorId,
    category: blogData.category || "noticias-generales",
    iconUrl:
      blogData.iconUrl || "https://via.placeholder.com/64x64?text=BlogIcon",
  });
  return blog;
};

// --- Test Suite para getBlogs ---
describe("getBlogs - Tests de Lógica de Obtención de Blogs (Integración)", () => {
  let adminId; // ID del usuario administrador de prueba, necesario para crear blogs

  // Conectar a la base de datos y crear un usuario administrador antes de todas las pruebas
  beforeAll(async () => {
    await connectToDatabase(
      process.env.DATABASE_URL,
      process.env.DATABASE_NAME
    );
    console.log(
      "Conexión a la base de datos de test establecida para getBlogs tests."
    );

    await clearCollections(); // Limpiar completamente la base de datos antes de empezar
    const adminUser = await createTestAdmin();
    adminId = adminUser._id.toString();
    console.log(`Usuario administrador de prueba creado con ID: ${adminId}`);
  }, 20000); // Aumenta el timeout para la configuración inicial de la DB

  // Limpiar las colecciones de blogs antes de CADA prueba
  // Esto asegura que cada test se ejecute en un estado aislado y predecible.
  beforeEach(async () => {
    await Blog.deleteMany({}); // Solo limpia blogs, el adminUser se mantiene
    console.log("Colección de blogs limpiada antes de cada test.");
    jest.restoreAllMocks(); // Restaura mocks que puedan haber sido usados en tests individuales
  });

  // Desconectar de la base de datos y limpiar usuarios/blogs después de todas las pruebas
  afterAll(async () => {
    await clearCollections(); // Limpiar la base de datos completamente al final
    await disconnectFromDatabase();
    console.log(
      "Conexión a la base de datos de test cerrada y datos limpiados."
    );
  }, 10000); // Timeout para la limpieza final

  // ### Casos de Prueba ###

  // Test 1: Debería lanzar NotFoundError si no se encuentran blogs
  test("should throw NotFoundError if no blogs are found", async () => {
    // La colección de blogs está vacía gracias al beforeEach
    await expect(getBlogs()).rejects.toThrow(NotFoundError);
    await expect(getBlogs()).rejects.toThrow("No blog found");
  });

  // Test 2: Debería devolver todos los blogs en el formato correcto y ordenados por título
  test("should return all blogs in correct format and sorted by title", async () => {
    // Organizar: Crear varios blogs con títulos que permitan verificar el orden
    const blogZ = await createTestBlog(adminId, {
      title: "Zebra Blog",
      category: "laboral",
      content: "Contenido para Zebra Blog",
    });
    const blogA = await createTestBlog(adminId, {
      title: "Apple Blog",
      category: "juridico",
      content: "Contenido para Apple Blog",
    });
    const blogB = await createTestBlog(adminId, {
      title: "Banana Blog",
      category: "fiscal",
      content: "Contenido para Banana Blog",
    });

    // Actuar: Obtener los blogs
    const blogs = await getBlogs();

    // Afirmar:
    expect(blogs).toBeDefined();
    expect(Array.isArray(blogs)).toBe(true);
    expect(blogs.length).toBe(3);

    // Verificar formato: 'id' en lugar de '_id', y no '__v'
    blogs.forEach((blog) => {
      expect(blog).toHaveProperty("id");
      expect(typeof blog.id).toBe("string");
      expect(blog).not.toHaveProperty("_id"); // _id debe haber sido eliminado
      expect(blog).not.toHaveProperty("__v"); // __v debe haber sido excluido
      expect(blog).toHaveProperty("title");
      expect(blog).toHaveProperty("content");
      expect(blog).toHaveProperty("author");
      expect(blog).toHaveProperty("category");
    });

    // Verificar ordenación por título
    // El orden esperado es Apple, Banana, Zebra
    expect(blogs[0].title).toBe("Apple Blog");
    expect(blogs[1].title).toBe("Banana Blog");
    expect(blogs[2].title).toBe("Zebra Blog");

    // También puedes verificar que los IDs coinciden con los creados
    const expectedIds = [blogA.id, blogB.id, blogZ.id];
    const receivedIds = blogs.map((b) => b.id);
    expect(receivedIds).toEqual(expectedIds);
  }, 15000); // Aumenta el timeout si la DB tarda mucho en crear y consultar

  // Test 3: Debería lanzar SystemError en caso de un fallo inesperado de la base de datos
  test("should throw SystemError on unexpected database error", async () => {
    const errorMessage = "Simulated DB connection error during find operation";

    // Mockear Blog.find para que lance un error en algún punto de la cadena de Mongoose.
    // Necesitamos mockear la cadena de métodos que Blog.find() devuelve (.select().sort().lean()).
    const findSpy = jest.spyOn(Blog, "find");
    findSpy.mockImplementation(() => {
      return {
        select: jest.fn().mockReturnThis(), // Simula el .select() y devuelve el objeto para encadenar
        sort: jest.fn().mockReturnThis(), // Simula el .sort() y devuelve el objeto para encadenar
        lean: jest.fn().mockRejectedValue(new Error(errorMessage)), // Simula el .lean() y hace que falle
      };
    });

    // Actuar y Afirmar
    await expect(getBlogs()).rejects.toThrow(SystemError);
    await expect(getBlogs()).rejects.toThrow(
      `Error fetching blog: ${errorMessage}`
    );

    // El afterEach se encargará de restaurar el mock.
  }, 10000);
});
