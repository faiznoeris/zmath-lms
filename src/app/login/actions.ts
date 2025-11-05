"use client";

import { createClient } from "@/src/utils/supabase/client";
import { LoginFormInputs } from "./LoginForm/LoginForm.component";

export const loginApi = async (data: LoginFormInputs) => {
  const supabase = await createClient();
  const { email, password } = data;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  // Get role from user metadata
  if (authData.user) {
    const role = authData.user.user_metadata?.role as "student" | "teacher" | "admin" | undefined;
    const isApproved = authData.user.user_metadata?.is_approved;

    if (!role) throw new Error("User role not found");

    // Check if teacher is approved
    if (role === "teacher" && isApproved === false) {
      // Sign out the user
      await supabase.auth.signOut();
      throw new Error("Your teacher account is pending approval. Please wait for admin approval.");
    }

    return {
      userId: authData.user.id,
      role: role,
    };
  }

  throw new Error("Login failed");
};
