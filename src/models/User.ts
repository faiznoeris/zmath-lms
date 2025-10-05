export interface User {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  role: 'student' | 'teacher' | 'admin';
  created_at: string;
  updated_at: string;
}
