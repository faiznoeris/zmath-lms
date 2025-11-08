"use server";

import { fetchStudents } from "@/src/services/enrollment.service";

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata: {
    display_name?: string;
    role?: string;
  };
}

/**
 * Server action to fetch all users with student role from Supabase Auth
 */
export async function fetchStudentsAction() {
  return await fetchStudents();
}