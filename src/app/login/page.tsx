"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/src/stores";

import LoginForm from "./LoginForm/LoginForm.component";

import styles from "./login.module.css";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuthStore();
  const message = searchParams.get("message");

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, router]);

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
