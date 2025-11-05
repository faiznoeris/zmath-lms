export interface Material {
  id: string;
  title: string;
  type: "video" | "document";
  content_url: string;
  description?: string;
  lesson_id: string | null;
  created_at: string;
}

export interface CreateMaterialInput {
  title: string;
  type: "video" | "document";
  content_url: string;
  description?: string;
  lesson_id?: string;
}

export interface UpdateMaterialInput {
  title?: string;
  type?: "video" | "document";
  content_url?: string;
  description?: string;
  lesson_id?: string;
}
