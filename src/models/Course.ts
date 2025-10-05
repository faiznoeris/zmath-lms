export interface Course {
  id: string;
  title: string;
  description?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  thumbnail_url?: string;
  creator_id?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
