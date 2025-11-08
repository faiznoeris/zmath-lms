"use server";

import { createClient } from "@/src/utils/supabase/server";
import { createAdminClient } from "@/src/utils/supabase/admin";
import { fetchGroupedPendingSubmissions, GroupedSubmissions } from "@/src/services/submission.service";
import { fetchTeacherResults, ResultWithDetails } from "@/src/services/result.service";

export async function fetchGroupedPendingSubmissionsAction(): Promise<{
  success: boolean;
  data?: GroupedSubmissions[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Fetch grouped submissions with userId
    const result = await fetchGroupedPendingSubmissions(user.id);
    
    if (!result.success || !result.data) {
      return result;
    }

    // Enrich submissions with student data from admin API
    const enrichedData: GroupedSubmissions[] = await Promise.all(
      result.data.map(async (group) => {
        const enrichedSubmissions = await Promise.all(
          group.submissions.map(async (submission) => {
            const { data: studentData } = await supabaseAdmin.auth.admin.getUserById(
              submission.user_id
            );

            return {
              ...submission,
              student_email: studentData?.user?.email || "",
              student_name: studentData?.user?.user_metadata?.display_name || 
                           studentData?.user?.user_metadata?.full_name,
            };
          })
        );

        return {
          ...group,
          submissions: enrichedSubmissions,
        };
      })
    );

    return { success: true, data: enrichedData };
  } catch (error) {
    console.error("Error in fetchGroupedPendingSubmissionsAction:", error);
    return { success: false, error: "Failed to fetch submissions" };
  }
}

export async function fetchResultsHistoryAction(): Promise<{
  success: boolean;
  data?: ResultWithDetails[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Fetch results for teacher's courses
    const result = await fetchTeacherResults(user.id);

    if (!result.success || !result.data) {
      return result;
    }

    // Enrich results with student data from admin API
    const enrichedData: ResultWithDetails[] = await Promise.all(
      result.data.map(async (resultItem) => {
        const { data: studentData } = await supabaseAdmin.auth.admin.getUserById(
          resultItem.user_id
        );

        return {
          ...resultItem,
          student: studentData?.user
            ? {
                id: studentData.user.id,
                email: studentData.user.email || "",
                full_name:
                  studentData.user.user_metadata?.display_name ||
                  studentData.user.user_metadata?.full_name,
              }
            : undefined,
        };
      })
    );

    return { success: true, data: enrichedData };
  } catch (error) {
    console.error("Error in fetchResultsHistoryAction:", error);
    return { success: false, error: "Failed to fetch results" };
  }
}
