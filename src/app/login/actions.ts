"use server";

import { createClient } from "@/src/utils/supabase/server";
import { LoginFormInputs } from "./LoginForm/LoginForm.component";

export const loginApi = async (data: LoginFormInputs) => {
  const supabase = await createClient();
  const { email, password } = data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
};
