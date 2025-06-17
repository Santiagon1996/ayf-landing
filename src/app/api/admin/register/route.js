import { connectToDatabase } from "../../../../lib/db/connection.js";
import { registerUser } from "../../_logic/registerUser.js";
import { withErrorHandler } from "../../../../lib/handlers/withErrorHandler.js";
import { NextResponse } from "next/server"; // <-- Importar NextResponse para la respuesta exitosa

export async function POST(req, params) {
  // params es opcional si no lo usas en esta ruta
  // Conectamos a la base de datos
  await connectToDatabase();

  // withErrorHandler ahora recibe una función que solo toma `request` y `params`
  // y espera que esta función interna retorne un NextResponse.
  // El 'req' y 'params' de la función POST externa se pasan directamente a la función envuelta.
  return await withErrorHandler(async (request, routeParams) => {
    // Obtener los datos del body como un objeto
    const userData = await request.json();

    // Lógica de registro
    await registerUser(userData);

    // En caso de éxito, devolver directamente un NextResponse
    return NextResponse.json(null, { status: 201 }); // 201 Created, body puede ser null o un objeto de éxito
  })(req, params); // Pasa los argumentos originales de la función POST a tu HOC
}
