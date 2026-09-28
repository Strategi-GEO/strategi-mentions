import { NextResponse, type NextRequest } from "next/server";

// Site-wide password gate for hosted deployments. The app has no user accounts
// yet, so a public URL needs a shared credential in front of it. The gate is off
// when SITE_PASSWORD is unset (local dev and demo machines). Any username works.
export function middleware(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next();

  const [scheme, encoded] = (request.headers.get("authorization") ?? "").split(" ");
  if (scheme === "Basic" && encoded) {
    const decoded = atob(encoded);
    if (decoded.slice(decoded.indexOf(":") + 1) === password) return NextResponse.next();
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Strategi Mentions", charset="UTF-8"' },
  });
}

export const config = {
  // Cron routes authenticate with CRON_SECRET; static assets need no gate.
  matcher: ["/((?!api/cron|_next/static|_next/image|favicon.ico).*)"],
};
