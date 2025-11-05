"use server";

import { createClient } from "@/src/utils/supabase/server";
import { createAdminClient } from "@/src/utils/supabase/admin";
import { 
  Enrollment, 
  CreateEnrollmentInput, 
  EnrollmentWithDetails 
} from "@/src/models/Enrollment";

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata: {
    full_name?: string;
    username?: string;
    role?: string;
  };
}

/**
 * Fetch all users with student role from Supabase Auth
 */
export async function fetchStudents(): Promise<{ success: boolean; data?: AuthUser[]; error?: string }> {
  try {
    const supabaseAdmin = createAdminClient();
    
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
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
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch all enrollments with course details
 */
export async function fetchEnrollments(): Promise<{ success: boolean; data?: EnrollmentWithDetails[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        course:courses!enrollments_course_id_fkey(id, title)
      `)
      .order("enrolled_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as EnrollmentWithDetails[] };
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create a new enrollment
 */
export async function createEnrollment(
  input: CreateEnrollmentInput
): Promise<{ success: boolean; data?: Enrollment; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .insert([input])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Enrollment };
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete an enrollment
 */
export async function deleteEnrollment(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("enrollments")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch enrollments for a specific student
 */
export async function fetchStudentEnrollments(
  userId: string
): Promise<{ success: boolean; data?: EnrollmentWithDetails[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        course:courses!enrollments_course_id_fkey(id, title, description)
      `)
      .eq("user_id", userId)
      .order("enrolled_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as EnrollmentWithDetails[] };
  } catch (error) {
    console.error("Error fetching student enrollments:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch enrollments for the current logged-in student
 */
export async function fetchMyEnrollments(): Promise<{ success: boolean; data?: EnrollmentWithDetails[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        course:courses!enrollments_course_id_fkey(id, title, description)
      `)
      .eq("user_id", user.id)
      .order("enrolled_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as EnrollmentWithDetails[] };
  } catch (error) {
    console.error("Error fetching my enrollments:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
