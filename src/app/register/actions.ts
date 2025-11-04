"use server";

import { createClient } from "@/src/utils/supabase/server";
import { RegisterFormInputs } from "./RegisterForm/RegisterForm.component";

export const registerApi = async (data: RegisterFormInputs) => {
  const supabase = await createClient();
  const { fullName, email, password, role } = data;

  // Determine if the user should be approved by default
  // Teachers need approval, students and admins are auto-approved
  const isApproved = role === "teacher" ? false : true;

  // Register the user
  const { error: signUpError } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        display_name: fullName,
        role: role,
        is_approved: isApproved,
      },
    },
  });

  if (signUpError) throw new Error(signUpError.message);

  // If the user is a teacher (not approved), don't auto-login
  if (role === "teacher") {
    return {
      userId: null,
      role: role,
      needsApproval: true,
    };
  }

  // Auto-login after successful registration for approved users
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (signInError) throw new Error(signInError.message);

  // Return user role for redirect
  const userRole = authData.user.user_metadata?.role as "student" | "teacher" | "admin" | undefined;
  
  return {
    userId: authData.user.id,
    role: userRole || "student",
    needsApproval: false,
  };
};
