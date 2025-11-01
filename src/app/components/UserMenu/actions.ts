"use client";

import { createClient } from "@/src/utils/supabase/client";

export const logoutUser = async () => {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) throw new Error(error.message);
};
