"use client";
import React from "react";

import RegisterForm from "./RegisterForm/RegisterForm.component";
import styles from "./register.module.css";

export default function RegisterPage() {
  return (
    <div className={styles.AuthContainer}>
      <RegisterForm />
    </div>
  );
}
