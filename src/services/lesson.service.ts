"use server";

import { createClient } from "@/src/utils/supabase/server";
import { Lesson } from "@/src/models/Lesson";

export interface LessonWithCourse extends Lesson {
  course: {
    id: string;
    title: string;
  };
}

/**
 * Fetch all lessons with course details
 */
export async function fetchLessons(): Promise<{ success: boolean; data?: LessonWithCourse[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lessons")
      .select(`
        *,
        course:courses!lessons_course_id_fkey(id, title)
      `)
      .order("course_id", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as LessonWithCourse[] };
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch lesson by ID
 */
export async function fetchLessonById(id: string): Promise<{ success: boolean; data?: Lesson; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create a new lesson
 */
export async function createLesson(lesson: Omit<Lesson, "id" | "created_at">): Promise<{ success: boolean; data?: Lesson; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lessons")
      .insert(lesson)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error creating lesson:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update an existing lesson
 */
export async function updateLesson(id: string, lesson: Partial<Omit<Lesson, "id" | "created_at">>): Promise<{ success: boolean; data?: Lesson; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lessons")
      .update(lesson)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error updating lesson:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a lesson
 */
export async function deleteLesson(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("lessons").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch lessons by course ID
 */
export async function fetchLessonsByCourse(courseId: string): Promise<{ success: boolean; data?: Lesson[]; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching lessons by course:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
