// Handles course business logic
import { createClient } from "@/src/utils/supabase/client";
import { Course } from "@/src/models/Course";

const supabase = createClient();

/**
 * Fetch all courses
 */
export const fetchCoursesApi = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }

  return data as Course[];
};
