"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import styles from "./login.module.css";


type LoginFormInputs = {
  username: string;
  password: string;
};

// Simulate login API call
async function loginApi(data: LoginFormInputs) {
  // Replace with your real API call
  await new Promise((res) => setTimeout(res, 1000));
  if (data.username !== "admin" || data.password !== "admin") {
    throw new Error("Invalid credentials");
  }
  return { token: "fake-token" };
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      // TODO: handle successful login (e.g., save token, redirect)
      // window.location.href = "/dashboard";
    },
  });

  const onSubmit = (data: LoginFormInputs) => {
    mutation.reset();
    mutation.mutate(data);
  };

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginForm} onSubmit={handleSubmit(onSubmit)}>
        <h2 className={styles.title}>Login</h2>
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
        <label className={styles.label} htmlFor="password">Password</label>
        <input
          className={styles.input}
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password", { required: "Password is required" })}
        />
        {errors.password && (
          <div className={styles.error}>{errors.password.message}</div>
        )}
        {mutation.isError && mutation.error instanceof Error && (
          <div className={styles.error}>{mutation.error.message}</div>
        )}
        <button
          className={styles.loginButton}
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Logging in..." : "Login"}
        </button>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => window.location.href = "/register"}
          >
            Register
          </button>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => window.location.href = "/forgot-password"}
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
}
