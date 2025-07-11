import { NextResponse } from "next/server";
import { withErrorHandler } from "../../../../lib/handlers/index.js";

export async function POST(req) {
  return await withErrorHandler(async () => {
    const response = NextResponse.json(
      { message: "Logout exitoso" },
      { status: 200 }
    );

    // Borra la cookie enviando un Set-Cookie con maxAge=0
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  })(req);
}
