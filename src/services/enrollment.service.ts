import { createClient } from "@/src/utils/supabase/client";
import { 
  Enrollment, 
  CreateEnrollmentInput, 
  EnrollmentWithDetails 
} from "@/src/models/Enrollment";

const supabase = createClient();

/**
 * Fetch all enrollments with course details
 * Note: User details are fetched separately from Supabase Auth
 */
export const fetchEnrollmentsApi = async (): Promise<EnrollmentWithDetails[]> => {
  const { data, error } = await supabase
    .from("enrollments")
    .select(`
      *,
      course:courses!enrollments_course_id_fkey(id, title)
    `)
    .order("enrolled_at", { ascending: false });

  if (error) {
    console.error("Error fetching enrollments:", error);
    throw error;
  }

  return data as EnrollmentWithDetails[];
};

// Note: fetchStudentsApi removed - use fetchStudentsAction from server actions instead
// Students are fetched from Supabase Auth using admin client

/**
 * Create a new enrollment
 */
export const createEnrollmentApi = async (
  input: CreateEnrollmentInput
): Promise<Enrollment> => {
  const { data, error } = await supabase
    .from("enrollments")
    .insert([input])
    .select()
    .single();

  if (error) {
    console.error("Error creating enrollment:", error);
    throw error;
  }

  return data as Enrollment;
};

/**
 * Delete an enrollment
 */
export const deleteEnrollmentApi = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from("enrollments")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting enrollment:", error);
    throw error;
  }
};

/**
 * Fetch enrollments for a specific student
 */
export const fetchStudentEnrollmentsApi = async (
  userId: string
): Promise<EnrollmentWithDetails[]> => {
  const { data, error } = await supabase
    .from("enrollments")
    .select(`
      *,
      course:courses!enrollments_course_id_fkey(id, title, description)
    `)
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });

  if (error) {
    console.error("Error fetching student enrollments:", error);
    throw error;
  }

  return data as EnrollmentWithDetails[];
};

/**
 * Fetch enrollments for the current logged-in student
 */
export const fetchMyEnrollmentsApi = async (): Promise<EnrollmentWithDetails[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  return fetchStudentEnrollmentsApi(user.id);
};
