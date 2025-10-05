import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/neo")) {
    return NextResponse.redirect("https://nolaskote.github.io/simulatio_next");
  }
  return NextResponse.next();
}
