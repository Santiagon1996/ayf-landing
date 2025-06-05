import { errors } from "@/shared";
import { withAuth } from "@/lib/middleware/withAuth";
const { AuthorizationError, SystemError } = errors;

// 1. Importa los mocks de 'next/headers' desde tu archivo __mocks__
import { mockCookies } from "../../../__mocks__/next/headers.js"; // Ajusta la ruta si es necesario

// 2. Mockea el módulo 'jsonwebtoken'
jest.mock("jsonwebtoken", () => {
  // Aquí definimos y exportamos las clases de error que JWT utiliza
  // Son clases vacías, pero suficientes para que 'instanceof' funcione.
  class JsonWebTokenError extends Error {
    constructor(message) {
      super(message);
      this.name = "JsonWebTokenError";
    }
  }
  class TokenExpiredError extends Error {
    constructor(message, expiredAt) {
      super(message);
      this.name = "TokenExpiredError";
      this.expiredAt = expiredAt;
    }
  }

  return {
    verify: jest.fn(),
    // Exportamos las clases de error mockeadas para que 'instanceof' las encuentre
    JsonWebTokenError,
    TokenExpiredError,
  };
});

// 3. Importa el módulo 'jsonwebtoken' mockeado
import jwt from "jsonwebtoken";

// 4. Mockea 'NextResponse' de 'next/server'
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status || 200,
      body: body,
    })),
  },
}));

// 5. Importa NextResponse mockeado
import { NextResponse } from "next/server";

// Configura una variable de entorno JWT_SECRET para las pruebas
// Esto es importante para que jwt.verify tenga un secreto con el que operar,
// incluso si su comportamiento está mockeado para los tests.
process.env.JWT_SECRET = "supersecretkeyparatesting";

describe("withAuth Middleware (Sin Lógica de Roles Adicional)", () => {
  let mockHandler;
  let mockRequest;
  let mockGetCookieValue; // Para controlar el valor de la cookie "accessToken"

  beforeEach(() => {
    jest.clearAllMocks(); // Limpia todos los mocks entre tests

    // Reinicia JWT_SECRET por si algún test lo cambia (aunque en este caso no debería ser necesario)
    process.env.JWT_SECRET = "supersecretkeyparatesting";

    // Un handler mockeado que simplemente devuelve una respuesta exitosa
    mockHandler = jest.fn(async (req, { userId, userRole }) => {
      // El handler debería recibir userId y userRole
      return NextResponse.json(
        { message: "Handler executed successfully", userId, userRole },
        { status: 200 }
      );
    });

    // Configuración para el mock de cookies().get("accessToken")
    mockGetCookieValue = jest.fn(); // Por defecto, devolverá undefined
    mockCookies.mockReturnValue({
      get: jest.fn((name) => {
        if (name === "accessToken") {
          return mockGetCookieValue()
            ? { value: mockGetCookieValue() }
            : undefined;
        }
        return undefined;
      }),
    });

    // Una Request simple de Next.js. Para withAuth, a menudo solo se necesita el objeto req
    // para pasarlo al handler, no sus propiedades internas.
    mockRequest = {};
  });

  // --- Caso 1: Sin token de acceso ---
  test("should return 401 if access token is missing", async () => {
    mockGetCookieValue.mockReturnValue(undefined); // Asegura que no hay accessToken

    const wrappedHandler = withAuth(mockHandler);
    const response = await wrappedHandler(mockRequest);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Access token is missing" });
    expect(mockHandler).not.toHaveBeenCalled(); // El handler NO debe ser llamado
  });

  // --- Caso 2: Token de acceso inválido (formato incorrecto) ---
  test("should return 401 if access token is invalid (malformed)", async () => {
    mockGetCookieValue.mockReturnValue("definitely.not.a.jwt"); // Un token malformado
    jwt.verify.mockImplementation(() => {
      // Simula que jwt.verify lanza un JsonWebTokenError
      throw new jwt.JsonWebTokenError("invalid token");
    });

    const wrappedHandler = withAuth(mockHandler);
    const response = await wrappedHandler(mockRequest);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Invalid or expired access token",
    });
    expect(jwt.verify).toHaveBeenCalledTimes(1);
    expect(mockHandler).not.toHaveBeenCalled();
  });

  // --- Caso 3: Token de acceso expirado ---
  test("should return 401 if access token is expired", async () => {
    mockGetCookieValue.mockReturnValue("valid.but.expired.jwt");
    jwt.verify.mockImplementation(() => {
      // Simula que jwt.verify lanza un TokenExpiredError
      throw new jwt.TokenExpiredError("jwt expired", new Date());
    });

    const wrappedHandler = withAuth(mockHandler);
    const response = await wrappedHandler(mockRequest);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Invalid or expired access token",
    });
    expect(jwt.verify).toHaveBeenCalledTimes(1);
    expect(mockHandler).not.toHaveBeenCalled();
  });

  // --- Caso 4: Token válido pero sin 'id' en el payload (asumiendo que el rol siempre será admin) ---
  test("should return 401 if valid token payload is missing userId", async () => {
    mockGetCookieValue.mockReturnValue("valid.token.payload");
    // Simulamos un token válido, pero con un payload incompleto
    jwt.verify.mockReturnValue({ role: "admin" }); // Solo tiene el rol, falta el id

    const wrappedHandler = withAuth(mockHandler);
    const response = await wrappedHandler(mockRequest);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Invalid token payload: userId or role is missing",
    }); // El mensaje de error de tu middleware sigue siendo genérico para ambos
    expect(jwt.verify).toHaveBeenCalledTimes(1);
    expect(mockHandler).not.toHaveBeenCalled();
  });

  // --- Caso 5: Token de acceso válido y handler ejecutado ---
  test("should call the handler with userId and userRole if access token is valid", async () => {
    const testUserId = "testUser123";
    const testUserRole = "admin"; // Siempre será admin

    const validToken = "a.valid.jwt.token";

    mockGetCookieValue.mockReturnValue(validToken);
    // jwt.verify devuelve un payload completo
    jwt.verify.mockReturnValue({ id: testUserId, role: testUserRole });

    const wrappedHandler = withAuth(mockHandler);
    const response = await wrappedHandler(mockRequest);

    // El handler debe haber sido llamado
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(mockRequest, {
      userId: testUserId,
      userRole: testUserRole,
    });

    // La respuesta debe ser la que devuelve el handler mockeado
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Handler executed successfully",
      userId: testUserId,
      userRole: testUserRole,
    });
    expect(jwt.verify).toHaveBeenCalledWith(validToken, process.env.JWT_SECRET);
  });

  // --- Caso 6: Manejo de errores inesperados durante la verificación del token ---
  test("should return 500 for unexpected errors during token verification", async () => {
    mockGetCookieValue.mockReturnValue("any.token.value");
    jwt.verify.mockImplementation(() => {
      // Simula un error inesperado (no un JsonWebTokenError o TokenExpiredError)
      throw new Error("Something went wrong with JWT verification service");
    });

    const wrappedHandler = withAuth(mockHandler);
    const response = await wrappedHandler(mockRequest);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Internal server error." });
    expect(jwt.verify).toHaveBeenCalledTimes(1);
    expect(mockHandler).not.toHaveBeenCalled();
  });
});
