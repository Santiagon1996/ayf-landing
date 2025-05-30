import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorHandler } from "../../../../lib/handlers/index.js";
import { getUserFromToken } from "../../_logic/getUserFromToken.js";
export async function GET(req) {
  return await withErrorHandler(async (request) => {
    const accessToken = cookies().get("accessToken")?.value;
    const user = await getUserFromToken(accessToken);
    return NextResponse.json({ user }, { status: 200 });
  })(req);
}
