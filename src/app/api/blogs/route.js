import { connectToDatabase } from "@/lib/db/connection.js";
import { withErrorHandler } from "@/lib/handlers/withErrorHandler.js";
import { withAuth } from "@/lib/middleware/withAuth.js";
import { getBlogs, addBlog } from "../_logic/index.js";
import { NextResponse } from "next/server";

export async function GET(req) {
  return await withErrorHandler(async (request) => {
    await connectToDatabase();

    const services = await getBlogs();

    // Responder con éxito
    return NextResponse.json(services);
  })(req);
}
export async function POST(req) {
  return await withErrorHandler(
    withAuth(async (request, { userId, userRole }) => {
      await connectToDatabase();

      const blogData = await request.json();

      const newBlog = await addBlog(blogData, userId);

      return NextResponse.json(newBlog, { status: 201 });
    })
  )(req);
}
