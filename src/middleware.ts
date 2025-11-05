import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./utils/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Check if accessing dashboard routes
  if (pathname.startsWith("/dashboard")) {
    // Create a Supabase client for server-side
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // Not needed for reading
          },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Get role from user metadata
    const role = user.user_metadata?.role as
      | "student"
      | "teacher"
      | "admin"
      | undefined;
    const isApproved = user.user_metadata?.is_approved;

    // Check if teacher is not approved yet
    if (role === "teacher" && isApproved === false) {
      // Redirect unapproved teachers to a pending approval page or login
      if (pathname !== "/login") {
        return NextResponse.redirect(
          new URL("/login?message=pending_approval", request.url)
        );
      }
    }

    // Protect /dashboard/admin routes - only for admins
    if (pathname.startsWith("/dashboard/admin")) {
      if (role !== "admin") {
        // Redirect non-admins away from admin dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Protect /dashboard/teacher routes - only for teachers and admins
    if (pathname.startsWith("/dashboard/teacher")) {
      if (role !== "teacher" && role !== "admin") {
        // Redirect students away from teacher dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Protect /dashboard/student routes - only for students
    if (pathname.startsWith("/dashboard/student")) {
      if (role !== "student") {
        // Redirect non-students away from student dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Redirect based on role from main dashboard
    if (pathname === "/dashboard") {
      if (role === "admin") {
        return NextResponse.redirect(new URL("/dashboard/admin", request.url));
      } else if (role === "teacher") {
        return NextResponse.redirect(
          new URL("/dashboard/teacher", request.url)
        );
      } else if (role === "student") {
        return NextResponse.redirect(
          new URL("/dashboard/student", request.url)
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
