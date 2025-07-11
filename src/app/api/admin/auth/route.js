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
    const user = await authenticateUser(userData);

    // 3. Generar el token JWT
    const token = createToken(user.id, user.role);

    // 4. Crear la respuesta JSON
    const response = NextResponse.json(
      {
        message: "Inicio de sesión exitoso",
        user: { id: user.id, name: user.name, role: user.role },
      },
      { status: 200 }
    );

    // 5. Establecer la cookie HttpOnly y Secure en la respuesta (IMPORTANTE: en response, no en cookies())
    response.cookies.set("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1, // 1 hora
      path: "/",
    });

    // 6. Devolver la respuesta con la cookie
    return response;
  })(req, params); // Pasa los argumentos originales de la función POST a tu HOC
}
