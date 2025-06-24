import { connectToDatabase } from "@/lib/db/connection.js";
import { withAuth } from "!@/lib/middleware/withAuth.js";
import { withErrorHandler } from "@/lib/handlers/withErrorHandler.js";
import { updateService, deleteService } from "../../_logic/index.js";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  return await withErrorHandler(
    withAuth(async (req, { userId, userRole }) => {
      await connectToDatabase();
      const adminId = userId;

      const { serviceId } = await params;
      const updatesData = await req.json();

      //actualizar propiedad
      await updateService(updatesData, adminId, serviceId);

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
      const { serviceId } = await params;

      //actualizar propiedad
      await deleteService(adminId, serviceId);

      // Responder con éxito
      return new NextResponse(null, { status: 204 });
    })
  )(req, params);
}
