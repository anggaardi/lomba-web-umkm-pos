import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // 1. Abaikan path internal (api/auth, static files, dll)
  if (
    url.pathname.startsWith("/api/auth") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/static") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Identifikasi Hostname (Localhost atau Domain Asli)
  // Contoh: kopisenja.localhost:3000 -> Subdomain: kopisenja
  // Contoh: umkmflow.com -> Subdomain: null
  let subdomain: string | null = null;

  if (hostname.includes(".localhost:3000")) {
    subdomain = hostname.split(".localhost:3000")[0];
  } else if (hostname.includes(".umkmflow.com")) {
    subdomain = hostname.split(".umkmflow.com")[0];
  }

  // 3. Jika ini adalah Central Domain (umkmflow.com)
  if (!subdomain || subdomain === "www") {
    return NextResponse.next();
  }

  // 4. Jika ini adalah Subdomain (Tenant Storefront)
  // Kita akan me-rewrite request ke path khusus tenant /s/[slug]
  // Tapi kita butuh slug aslinya. Karena kita belum bisa query DB di edge dengan mudah tanpa caching,
  // kita asumsikan subdomain == slug tenant untuk sementara.
  
  // Rewrite ke internal route /s/[subdomain]/...
  const tenantUrl = new URL(`/s/${subdomain}${url.pathname}`, request.url);
  return NextResponse.rewrite(tenantUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
