import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Define las rutas que quieres proteger
  const protectedRoutes = [
    "/dashboard",
    "/dashboard/settings",
    "/dashboard/admin",
    "/dashboard/profile",
    "/dashboard/service",
    "/dashboard/blogs",
  ];

  // 2. Define la ruta a la que redirigir si no hay token
  const loginUrl = "/login"; // Asegúrate de que esta sea la ruta a tu página de login

  // 3. Comprueba si la ruta actual es una de las protegidas
  if (protectedRoutes.includes(pathname)) {
    // 4. Intenta obtener el token de las cookies
    const accessToken = request.cookies.get("accessToken")?.value;
    console.log(
      `Middleware for ${pathname}: accessToken found?`,
      !!accessToken
    );

    // 5. Si no hay token, redirige al login
    if (!accessToken) {
      // Puedes añadir un parámetro de "redireccionar a" para que después del login vuelva al dashboard
      const redirectUrl = new URL(loginUrl, request.url);
      redirectUrl.searchParams.set("redirect", pathname); // Opcional: para que redirija de vuelta
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  // Permite todas las demás rutas
  return NextResponse.next();
}

// 6. Define para qué rutas debe ejecutarse este middleware
export const config = {
  matcher: ["/dashboard/:path*"],
};
