import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Serve the admin dashboard only on the `admin.` subdomain by rewriting its
 * paths into the /admin route tree, and keep /admin unreachable on the apex.
 * Auth is enforced in the /admin server layout (Node crypto), NOT here -
 * middleware runs on the edge and stays crypto-free.
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0].toLowerCase();
  const isAdminHost = host.startsWith("admin.");
  const { pathname } = req.nextUrl;

  // Apex / main site must never expose the dashboard.
  if (!isAdminHost && pathname.startsWith("/admin")) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (isAdminHost) {
    // API + assets + already-prefixed paths resolve as-is (no /admin prefix
    // so /api/admin/login etc. keep working from the subdomain).
    if (
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/admin") ||
      pathname === "/favicon.ico" ||
      /\.[a-zA-Z0-9]+$/.test(pathname)
    ) {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
