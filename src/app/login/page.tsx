"use client";

import React from "react";

import LoginForm from "./LoginForm/LoginForm.component";

import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <div className={styles.loginContainer}>
      <LoginForm />
    </div>
  );
}
