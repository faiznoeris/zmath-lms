"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/src/stores";
import { createClient } from "@/src/utils/supabase/client";

import LoginForm from "./LoginForm/LoginForm.component";

import styles from "./login.module.css";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuthStore();
  const message = searchParams.get("message");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Verify actual session with Supabase
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      setIsChecking(false);
      
      if (session?.user && isLoggedIn) {
        const role = session.user.user_metadata?.role;
        const isApproved = session.user.user_metadata?.is_approved;
        
        // Only redirect if user is approved or not a teacher
        if (role !== "teacher" || isApproved !== false) {
          router.push("/dashboard");
        }
      }
    };
    
    checkAuth();
  }, [isLoggedIn, router]);

  // Show loading while checking auth
  if (isChecking) {
    return <div className={styles.loginContainer}>Checking authentication...</div>;
  }

  // Don't render the form if user is logged in
  if (isLoggedIn) {
    return null;
  }

  return (
    <div className={styles.loginContainer}>
      <LoginForm message={message} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.loginContainer}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
