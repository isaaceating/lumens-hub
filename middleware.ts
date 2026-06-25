import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const legacyTrainingBuilderMatch = pathname.match(/^\/admin\/training\/([^/]+)$/);

  if (legacyTrainingBuilderMatch) {
    const programId = legacyTrainingBuilderMatch[1];

    if (programId !== "new") {
      const url = request.nextUrl.clone();
      url.pathname = `/admin/training/${programId}/builder`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/training/:path*"],
};
