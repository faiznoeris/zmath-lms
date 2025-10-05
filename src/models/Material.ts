export interface Material {
  id: string;
  lesson_id: string;
  title: string;
  type: 'video' | 'document' | 'interactive' | 'image';
  content_url?: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}
