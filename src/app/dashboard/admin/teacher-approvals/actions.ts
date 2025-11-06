"use server";

import { createAdminClient } from "@/src/utils/supabase/admin";

interface UserMetadata {
  role?: string;
  display_name?: string;
  is_approved?: boolean;
}

export interface PendingTeacher {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

/**
 * Server action to fetch teachers pending approval
 */
export async function fetchPendingTeachersAction(): Promise<{
  success: boolean;
  data?: PendingTeacher[];
  error?: string;
}> {
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

    // Filter for teachers who are not approved
    const pendingTeachers: PendingTeacher[] = users
      .filter((user) => {
        const metadata = user.user_metadata as UserMetadata;
        return (
          metadata?.role === "teacher" &&
          (metadata?.is_approved === false || metadata?.is_approved === null)
        );
      })
      .map((user) => {
        const metadata = user.user_metadata as UserMetadata;
        return {
          id: user.id,
          email: user.email || "",
          full_name: metadata?.display_name || "N/A",
          created_at: user.created_at,
        };
      });

    // Sort by created_at descending (newest first)
    pendingTeachers.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return {
      success: true,
      data: pendingTeachers,
    };
  } catch (error) {
    console.error("Error fetching pending teachers:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Server action to approve a teacher
 */
export async function approveTeacherAction(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAdmin = createAdminClient();

    // Get current user data
    const {
      data: { user },
      error: fetchError,
    } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (fetchError || !user) {
      return {
        success: false,
        error: fetchError?.message || "User not found",
      };
    }

    // Update user metadata to set is_approved to true
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          ...user.user_metadata,
          is_approved: true,
        },
      }
    );

    if (updateError) {
      return {
        success: false,
        error: updateError.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error approving teacher:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Server action to reject a teacher
 */
export async function rejectTeacherAction(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAdmin = createAdminClient();

    // Get current user data
    const {
      data: { user },
      error: fetchError,
    } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (fetchError || !user) {
      return {
        success: false,
        error: fetchError?.message || "User not found",
      };
    }

    // Update user metadata to change role back to student
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          ...user.user_metadata,
          role: "student",
          is_approved: false,
        },
      }
    );

    if (updateError) {
      return {
        success: false,
        error: updateError.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error rejecting teacher:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
