"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient } from "../utils/supabase/client";

import { useAuthStore } from "../stores";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const [queryClient] = React.useState(() => new QueryClient());
  const { setUser, setIsLoggedIn } = useAuthStore();

  React.useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        // Check if user is a teacher waiting for approval
        const role = session?.user?.user_metadata?.role;
        const isApproved = session?.user?.user_metadata?.is_approved;
        
        // Don't set user as logged in if they're an unapproved teacher
        if (role === "teacher" && isApproved === false) {
          setUser(null);
          setIsLoggedIn(false);
          return;
        }
        
        setUser(session?.user ?? null);
        setIsLoggedIn(true);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
