import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Define las rutas que quieres proteger
  const protectedRoutes = [
    "/dashboard",
    "/dashboard/settings",
    "/dashboard/admin",
    "/dashboard/profile",
    "/dashboard/services",
    "/dashboard/blogs",
  ]; // Añade todas las rutas de tu dashboard aquí

  // 2. Define la ruta a la que redirigir si no hay token
  const loginUrl = "/login"; // Asegúrate de que esta sea la ruta a tu página de login

  // 3. Comprueba si la ruta actual es una de las protegidas
  if (protectedRoutes.includes(pathname)) {
    // 4. Intenta obtener el token de las cookies
    const accessToken = request.cookies.get("accessToken")?.value;

    // 5. Si no hay token, redirige al login
    if (!accessToken) {
      // Puedes añadir un parámetro de "redireccionar a" para que después del login vuelva al dashboard
      const redirectUrl = new URL(loginUrl, request.url);
      redirectUrl.searchParams.set("redirect", pathname); // Opcional: para que redirija de vuelta
      return NextResponse.redirect(redirectUrl);
    }

    // Opcional: Si el token existe, puedes validarlo aquí mismo para mayor seguridad
    // o simplemente confiar en que tu API lo validará si se hace una llamada.
    // Sin embargo, para prevenir que un token expirado muestre la página,
    // es mejor hacer una validación ligera aquí.

    // Ejemplo de validación ligera (no completa como tu withAuth)
    // Para una validación completa y robusta en el middleware, deberías replicar
    // parte de la lógica de tu `withAuth` aquí o hacer una llamada interna
    // a una API para validarlo de forma más segura.
    // Para simplificar, y dado que ya tienes withAuth para las APIs,
    // podemos asumir que si el token existe, la página puede intentar cargar.
    // Si el token es inválido, las llamadas a tus APIs protegidas fallarán
    // y el front-end debería redirigir.

    // Si llegamos aquí, el token existe, permite la solicitud
    return NextResponse.next();
  }

  // Permite todas las demás rutas
  return NextResponse.next();
}

// 6. Define para qué rutas debe ejecutarse este middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - (public assets and authentication routes, etc.)
     * Add any other public routes that don't require authentication.
     */
    "/dashboard/:path*", // Protege /dashboard y todas sus subrutas (ej. /dashboard/settings)
    // '/ruta-adicional-protegida', // Si tuvieras otra página fuera de dashboard que necesite auth
  ],
};
