import { connectToDatabase } from "@/lib/db/connection.js";
import { withErrorHandler } from "@/lib/handlers/withErrorHandler.js";
import { withAuth } from "@/lib/middleware/withAuth.js";
import { getServices, addService } from "../_logic/index.js";
import { NextResponse } from "next/server";

export async function GET(req) {
  return await withErrorHandler(async (request) => {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const services = await getServices(type);

    // Responder con éxito
    return NextResponse.json(services);
  })(req);
}
export async function POST(req) {
  return await withErrorHandler(
    withAuth(async (request, { userId, userRole }) => {
      await connectToDatabase();

      const serviceData = await request.json();

      const newService = await addService(serviceData, userId);

      return NextResponse.json(newService, { status: 201 });
    })
  )(req);
}
