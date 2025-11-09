"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/src/utils/supabase/client";

import LoginForm from "./LoginForm/LoginForm.component";

import styles from "./login.module.css";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Verify actual session with Supabase
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const role = session.user.user_metadata?.role;
        const isApproved = session.user.user_metadata?.is_approved;
        
        // Only redirect if user is approved or not a teacher
        if (role !== "teacher" || isApproved !== false) {
          router.replace("/dashboard");
          return;
        }
      }
      
      setIsChecking(false);
    };
    
    checkAuth();
  }, [router]);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className={styles.loginContainer}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div>Memeriksa autentikasi...</div>
        </div>
      </div>
    );
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
