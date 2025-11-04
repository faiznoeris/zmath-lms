import { createClient } from "./supabase/client";

export async function getCurrentUserRole(): Promise<
  "student" | "teacher" | "admin" | null
> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get role from user_metadata (which contains raw_user_meta_data)
  const role = user.user_metadata?.role as "student" | "teacher" | "admin" | undefined;

  return role || null;
}

export function isTeacherOrAdmin(role: string | null): boolean {
  return role === "teacher" || role === "admin";
}

export function isStudent(role: string | null): boolean {
  return role === "student";
}
