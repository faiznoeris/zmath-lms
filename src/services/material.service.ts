

import { createClient } from "@/src/utils/supabase/client";
import { Material } from "@/src/models/Material";

export interface MaterialWithLesson extends Material {
  lesson: {
    id: string;
    title: string;
  };
}

/**
 * Fetch all materials with lesson details
 */
export async function fetchMaterials(): Promise<{ success: boolean; data?: MaterialWithLesson[]; error?: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("materials")
      .select(`
        *,
        lesson:lessons!materials_lesson_id_fkey(id, title)
      `)
      .order("lesson_id", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as MaterialWithLesson[] };
  } catch (error) {
    console.error("Error fetching materials:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch material by ID
 */
export async function fetchMaterialById(id: string): Promise<{ success: boolean; data?: Material; error?: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching material:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create a new material
 */
export async function createMaterial(material: Omit<Material, "id" | "created_at">): Promise<{ success: boolean; data?: Material; error?: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("materials")
      .insert(material)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error creating material:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update an existing material
 */
export async function updateMaterial(id: string, material: Partial<Omit<Material, "id" | "created_at">>): Promise<{ success: boolean; data?: Material; error?: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("materials")
      .update(material)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error updating material:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a material
 */
export async function deleteMaterial(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("materials").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting material:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Fetch materials by lesson ID
 */
export async function fetchMaterialsByLesson(lessonId: string): Promise<{ success: boolean; data?: Material[]; error?: string }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching materials by lesson:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
