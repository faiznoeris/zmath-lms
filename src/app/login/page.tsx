"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/stores";

import LoginForm from "./LoginForm/LoginForm.component";

import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();

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
      <LoginForm />
    </div>
  );
}
