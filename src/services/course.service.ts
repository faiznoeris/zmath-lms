// Handles course business logic
"use server";

import { createClient } from "@/src/utils/supabase/server";
import { Course } from "@/src/models/Course";

/**
 * Fetch all courses
 */
export async function fetchCourses(): Promise<{ success: boolean; data?: Course[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch course by ID
 */
export async function fetchCourseById(id: string): Promise<{ success: boolean; data?: Course; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching course:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create a new course
 */
export async function createCourse(course: Omit<Course, "id" | "created_at">): Promise<{ success: boolean; data?: Course; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("courses")
      .insert({
        ...course,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error creating course:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update an existing course
 */
export async function updateCourse(id: string, course: Partial<Omit<Course, "id" | "created_at">>): Promise<{ success: boolean; data?: Course; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("courses")
      .update(course)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error updating course:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a course
 */
export async function deleteCourse(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting course:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

