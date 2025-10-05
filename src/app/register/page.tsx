"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import styles from "../login/login.module.css";

interface RegisterFormInputs {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Simulate register API call
async function registerApi(data: RegisterFormInputs) {
  await new Promise((res) => setTimeout(res, 1000));
  if (data.password !== data.confirmPassword) {
    throw new Error("Passwords do not match");
  }
  // Simulate username taken
  if (data.username === "admin") {
    throw new Error("Username already taken");
  }
  return { success: true };
}

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>();
  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      // TODO: handle successful registration (e.g., redirect to login)
      // window.location.href = "/login";
    },
  });

  const onSubmit = (data: RegisterFormInputs) => {
    mutation.reset();
    mutation.mutate(data);
  };

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginForm} onSubmit={handleSubmit(onSubmit)}>
        <h2 className={styles.title}>Register</h2>
        <label className={styles.label} htmlFor="username">Username</label>
        <input
          className={styles.input}
          id="username"
          type="text"
          autoComplete="username"
          {...register("username", { required: "Username is required" })}
        />
        {errors.username && (
          <div className={styles.error}>{errors.username.message}</div>
        )}
        <label className={styles.label} htmlFor="email">Email</label>
        <input
          className={styles.input}
          id="email"
          type="email"
          autoComplete="email"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && (
          <div className={styles.error}>{errors.email.message}</div>
        )}
        <label className={styles.label} htmlFor="password">Password</label>
        <input
          className={styles.input}
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
        />
        {errors.password && (
          <div className={styles.error}>{errors.password.message}</div>
        )}
        <label className={styles.label} htmlFor="confirmPassword">Confirm Password</label>
        <input
          className={styles.input}
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword", { required: "Please confirm your password" })}
        />
        {errors.confirmPassword && (
          <div className={styles.error}>{errors.confirmPassword.message}</div>
        )}
        {mutation.isError && mutation.error instanceof Error && (
          <div className={styles.error}>{mutation.error.message}</div>
        )}
        <button
          className={styles.loginButton}
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Registering..." : "Register"}
        </button>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => window.location.href = "/login"}
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}