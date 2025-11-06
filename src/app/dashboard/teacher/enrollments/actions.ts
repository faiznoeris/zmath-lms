"use server";

import { createAdminClient } from "@/src/utils/supabase/admin";
import { createClient } from "@/src/utils/supabase/server";
import { EnrollmentWithDetails } from "@/src/models/Enrollment";

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata: {
    display_name?: string;
    role?: string;
  };
}

/**
 * Server action to fetch all users with student role from Supabase Auth
 */
export async function fetchStudentsAction(): Promise<{
  success: boolean;
  data?: AuthUser[];
  error?: string;
}> {
  try {
    const supabaseAdmin = createAdminClient();

    const {
      data: { users },
      error,
    } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Filter users with student role
    const students = users.filter(
      (user) => user.user_metadata?.role === "student"
    );

    return { success: true, data: students as AuthUser[] };
  } catch (error) {
    console.error("Error fetching students:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Server action to fetch enrollments with course and student details
 */
export async function fetchEnrollmentsWithDetailsAction(): Promise<{
  success: boolean;
  data?: EnrollmentWithDetails[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get current user to filter by their courses (for teachers)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Fetch enrollments with course details
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select(
        `
        id,
        enrolled_at,
        user_id,
        course_id,
        courses (
          id,
          title,
          description,
          user_id
        )
      `
      )
      .order("enrolled_at", { ascending: false });

    if (enrollmentsError) {
      return { success: false, error: enrollmentsError.message };
    }

    // For teachers, filter to only their courses
    const userMetadata = await supabase
      .from("users")
      .select("raw_user_meta_data")
      .eq("id", user.id)
      .single();

    const role = userMetadata.data?.raw_user_meta_data?.role;

    let filteredEnrollments = enrollments || [];

    if (role === "teacher") {
      filteredEnrollments = (enrollments || []).filter(
        (enrollment) => 
          (enrollment as { courses?: { user_id?: string } }).courses?.user_id === user.id
      );
    }

    // Now fetch student details from Auth
    const supabaseAdmin = createAdminClient();
    const enrichedEnrollments = await Promise.all(
      filteredEnrollments.map(async (enrollment) => {
        try {
          const {
            data: { user: studentUser },
          } = await supabaseAdmin.auth.admin.getUserById(enrollment.user_id);

          return {
            ...enrollment,
            user: studentUser
              ? {
                  id: studentUser.id,
                  email: studentUser.email || "Unknown",
                  full_name: studentUser.user_metadata?.display_name || "Unknown",
                }
              : undefined,
          };
        } catch (error) {
          console.error("Error fetching student details:", error);
          return enrollment;
        }
      })
    );

    return { success: true, data: enrichedEnrollments };
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
