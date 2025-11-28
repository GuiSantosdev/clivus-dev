import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Proteger rotas de SuperAdmin
    if (path.startsWith("/admin")) {
      if (token?.role !== "superadmin") {
        // Redireciona para dashboard se não for superadmin
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Proteger rotas que requerem acesso pago
    const protectedRoutes = [
      "/dashboard",
      "/transactions",
      "/reports",
      "/prolabore",
      "/compliance",
      "/investments",
      "/team",
    ];

    if (protectedRoutes.some((route) => path.startsWith(route))) {
      if (!token?.hasAccess) {
        // Redireciona para checkout se não tiver acesso
        return NextResponse.redirect(new URL("/checkout?plan=basic", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/reports/:path*",
    "/prolabore/:path*",
    "/compliance/:path*",
    "/investments/:path*",
    "/team/:path*",
    "/admin/:path*",
  ],
};

