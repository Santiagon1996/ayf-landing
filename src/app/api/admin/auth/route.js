// app/api/auth/login/route.js
import { authenticateUser } from "../../_logic/authenticateUser.js"; // Tu lógica de autenticación
import { connectToDatabase } from "../../../../lib/db/connection.js"; // Tu conexión a la DB
import { withErrorHandler } from "../../../../lib/handlers/index.js"; // Tu manejador de errores
import { createToken } from "../../../../lib/utils/createToken.js"; // Tu lógica de creación de token
import { NextResponse } from "next/server"; // Importa NextResponse para las respuestas del App Router
import { cookies } from "next/headers"; // Importa para manejar cookies HttpOnly

export async function POST(req, params) {
  await connectToDatabase(); // Conecta a la base de datos

  return await withErrorHandler(async (request, routeParams) => {
    const userData = await request.json(); // Obtener el cuerpo de la solicitud como un objeto

    // Validación temprana de los datos del usuario
    const user = await authenticateUser(userData); // Pasar el objeto completo

    // 3. Generar el token JWT
    const token = createToken(user.id, user.role);

    // 4. Establecer la cookie HttpOnly y Secure en la respuesta
    cookies().set("accessToken", token, {
      httpOnly: true, // No accesible por JavaScript del cliente
      secure: process.env.NODE_ENV === "production", // Solo sobre HTTPS en producción
      sameSite: "lax", // Protección CSRF (considera 'strict' si es posible)
      maxAge: 60 * 60 * 1, // 1 hora de validez (en segundos) - coincide con JWT_EXPIRES_IN si es '1h'
      path: "/", // Válido para todo el dominio
    });

    // 5. Devolver una respuesta de éxito al cliente
    // ¡IMPORTANTE!: No devuelvas el token en el body JSON.
    // Puedes devolver información NO SENSIBLE del usuario aquí, como su ID, email, nombre y rol,
    // para que el frontend pueda actualizar su estado de usuario.
    const { id, name, role } = user; // Recupera estos datos del objeto 'user' devuelto por authenticateUser
    return NextResponse.json(
      { message: "Inicio de sesión exitoso", user: { id, name, role } },
      { status: 200 }
    );
  })(req, params); // Pasa los argumentos originales de la función POST a tu HOC
}
