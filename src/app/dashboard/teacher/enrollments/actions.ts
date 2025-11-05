"use server";

import { createAdminClient } from "@/src/utils/supabase/admin";

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata: {
    full_name?: string;
    username?: string;
    role?: string;
  };
}

/**
 * Fetch all users with student role from Supabase Auth
 * This is a server action that uses admin privileges
 */
export async function fetchStudentsAction(): Promise<AuthUser[]> {
  try {
    const supabaseAdmin = createAdminClient();
    
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      console.error("Error fetching users:", error);
      throw error;
    }

    // Filter users with student role
    const students = users.filter(
      (user) => user.user_metadata?.role === "student"
    );

    return students as AuthUser[];
  } catch (error) {
    console.error("Error in fetchStudentsAction:", error);
    throw error;
  }
}
