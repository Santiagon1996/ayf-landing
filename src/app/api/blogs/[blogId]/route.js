import { connectToDatabase } from "@/lib/db/connection.js";
import { withAuth } from "!@/lib/middleware/withAuth.js";
import { withErrorHandler } from "@/lib/handlers/withErrorHandler.js";
import { updateBlog, deleteBlog } from "../../_logic/index.js";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  return await withErrorHandler(
    withAuth(async (req, { userId, userRole }) => {
      await connectToDatabase();
      const adminId = userId;

      const { blogId } = await params;
      const updatesData = await req.json();

      //actualizar propiedad
      await updateBlog(updatesData, adminId, blogId);

      // Responder con éxito
      return new NextResponse(null, { status: 204 });
    })
  )(req, params);
}

export async function DELETE(req, { params }) {
  return await withErrorHandler(
    withAuth(async (req, { userId, userRole }) => {
      await connectToDatabase();

      const adminId = userId;
      const { blogId } = await params;

      //actualizar propiedad
      await deleteBlog(adminId, blogId);

      // Responder con éxito
      return new NextResponse(null, { status: 204 });
    })
  )(req, params);
}
