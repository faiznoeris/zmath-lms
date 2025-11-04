export interface User {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  role: 'student' | 'teacher' | 'admin';
  is_approved?: boolean; // For teacher approval workflow
  created_at: string;
  updated_at: string;
}
