import { searchWord } from "@/lib/data";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextResponse, type NextRequest } from "next/server";
export const runtime = "edge";

export async function GET(request: NextRequest) {
  const searchParam = request.nextUrl.searchParams.get("search");

  if (searchParam) {
    const db = getRequestContext().env.DB;
    const result = await searchWord(db, searchParam);
    return NextResponse.json(result);
  }

  return new Response("No search parameter provided", { status: 400 });
}
