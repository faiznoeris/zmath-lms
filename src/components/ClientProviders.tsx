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
    // Check initial session on mount to sync with localStorage
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const role = session.user.user_metadata?.role;
        const isApproved = session.user.user_metadata?.is_approved;
        
        // Don't set user as logged in if they're an unapproved teacher
        if (role === "teacher" && isApproved === false) {
          setUser(null);
          setIsLoggedIn(false);
        } else {
          setUser(session.user);
          setIsLoggedIn(true);
        }
      } else {
        // No valid session - clear the store
        setUser(null);
        setIsLoggedIn(false);
      }
    };

    checkInitialSession();

    // Refresh session periodically (every 5 minutes) to prevent expiry
    const refreshInterval = setInterval(async () => {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error || !session) {
        // Session refresh failed - user needs to re-login
        setUser(null);
        setIsLoggedIn(false);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Listen for auth changes
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
      } else if (event === "TOKEN_REFRESHED") {
        // Session was refreshed - update the user
        if (session?.user) {
          const role = session.user.user_metadata?.role;
          const isApproved = session.user.user_metadata?.is_approved;
          
          if (role === "teacher" && isApproved === false) {
            setUser(null);
            setIsLoggedIn(false);
          } else {
            setUser(session.user);
            setIsLoggedIn(true);
          }
        }
      }
    });

    return () => {
      clearInterval(refreshInterval);
      data.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
