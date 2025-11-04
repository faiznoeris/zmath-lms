"use server";

import { createAdminClient } from "@/src/utils/supabase/admin";

interface UserMetadata {
  role?: string;
  username?: string;
  full_name?: string;
  is_approved?: boolean;
}

interface PendingTeacher {
  id: string;
  email: string;
  username: string;
  full_name: string;
  created_at: string;
}

export async function fetchPendingTeachersAction() {
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

    // Filter for teachers who are not approved (is_approved is false or null)
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
          username: metadata?.username || "",
          full_name: metadata?.full_name || "",
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
      error: "An unexpected error occurred",
    };
  }
}

export async function approveTeacherAction(userId: string) {
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
        error: "User not found",
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

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error approving teacher:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function rejectTeacherAction(userId: string) {
  try {
    const supabaseAdmin = createAdminClient();

    // Option 1: Delete the user completely
    const { error: deleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message,
      };
    }

    // Option 2: If you want to keep the user but mark as rejected, use this instead:
    // const { data: { user }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    // if (fetchError || !user) {
    //   return { success: false, error: "User not found" };
    // }
    // const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    //   user_metadata: {
    //     ...user.user_metadata,
    //     is_approved: false,
    //     rejected_at: new Date().toISOString(),
    //   },
    // });
    // if (updateError) {
    //   return { success: false, error: updateError.message };
    // }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error rejecting teacher:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
