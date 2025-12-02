import { withAuth } from "next-auth/middleware";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isOnboardingComplete = token?.onboardingComplete;
    const pathname = req.nextUrl.pathname;

    // Allow access to API routes, static files, etc.
    if (
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon") ||
      pathname.includes(".")
    ) {
      return;
    }

    // Rule 1: Unauthenticated users can only access landing page
    if (!isAuth && pathname !== "/") {
      return Response.redirect(new URL("/", req.url));
    }

    // Rule 2: Authenticated but not onboarded users must go to onboarding
    if (isAuth && !isOnboardingComplete && pathname !== "/onboarding") {
      return Response.redirect(new URL("/onboarding", req.url));
    }

    // Rule 3: Authenticated and onboarded users cannot access onboarding
    if (isAuth) {
      if (isOnboardingComplete && pathname === "/onboarding") {
        return Response.redirect(new URL("/dashboard", req.url));
      }
      if (pathname === "/") {
        return Response.redirect(new URL("/dashboard", req.url));
      }
    }

    // Allow access for all other cases
  },
  {
    callbacks: {
      authorized: () => true, // Always allow, handle auth in proxy function
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
