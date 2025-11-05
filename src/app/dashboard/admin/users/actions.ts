"use server";

import { createAdminClient } from "@/src/utils/supabase/admin";

interface UserMetadata {
  role?: string;
  username?: string;
  full_name?: string;
  is_approved?: boolean;
}

interface FormattedUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  is_approved: boolean | null;
  created_at: string;
}

export async function fetchAllUsersAction() {
  try {
    const supabaseAdmin = createAdminClient();

    const {
      data: { users },
      error,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    const formattedUsers: FormattedUser[] = users.map((user) => {
      const metadata = user.user_metadata as UserMetadata;
      return {
        id: user.id,
        email: user.email || "",
        username: metadata?.username || "",
        full_name: metadata?.full_name || "",
        role: metadata?.role || "student",
        is_approved: metadata?.is_approved ?? null,
        created_at: user.created_at,
      };
    });

    // Sort by created_at descending (newest first)
    formattedUsers.sort(
      (a: FormattedUser, b: FormattedUser) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return {
      success: true,
      data: formattedUsers,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
