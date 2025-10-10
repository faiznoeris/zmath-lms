"use server";

import { createClient } from "@/src/utils/supabase/server";
import { RegisterFormInputs } from "./RegisterForm/RegisterForm.component";

export const registerApi = async (data: RegisterFormInputs) => {
  const supabase = await createClient();
  const { username, email, password } = data;

  const { error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        display_name: username,
      },
    },
  });

  if (error) throw new Error(error.message);
};
