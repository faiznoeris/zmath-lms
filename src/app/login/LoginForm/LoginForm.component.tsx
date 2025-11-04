import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { TextField, Alert, Button, FormControlLabel, Checkbox } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import { PasswordField } from "../../components";
import { loginSchema } from "@/src/schemas";

import styles from "./LoginForm.module.css";
import { loginApi } from "../actions";

export interface LoginFormInputs {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const LoginForm = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: data => {
      if (data.role === "admin") {
        router.push("/dashboard/admin");
      }
      if (data.role === "teacher") {
        router.push("/dashboard/teacher");
      }
      if (data.role === "student") {
        router.push("/dashboard/student");
      }
    },
  });

  const onSubmit = (data: LoginFormInputs) => {
    mutation.reset();
    // Store remember me preference in localStorage before login
    try {
      if (data.rememberMe) {
        localStorage.setItem("zmath-remember-me", "true");
      } else {
        localStorage.removeItem("zmath-remember-me");
      }
    } catch (error) {
      // If localStorage is not available, continue anyway with default sessionStorage behavior
      console.warn("Unable to save remember me preference:", error);
    }
    mutation.mutate(data);
  };

  return (
    <form className={styles.registerForm} onSubmit={handleSubmit(onSubmit)}>
      <h2 className={styles.title}>Selamat Datang Kembali!</h2>
      <TextField
        error={!!errors.email}
        label="Email"
        helperText={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        error={!!errors.password}
        label="Password"
        helperText={errors.password?.message}
        {...register("password")}
      />
      <FormControlLabel
        control={<Checkbox {...register("rememberMe")} />}
        label="Remember me"
      />
      {mutation.isError && mutation.error instanceof Error && (
        <Alert severity="error">{mutation.error.message}</Alert>
      )}
      <div className={styles.actionButtons}>
        <Button
          loading={mutation.isPending}
          disabled={mutation.isPending}
          variant="contained"
          type="submit"
        >
          Login
        </Button>
        <Button onClick={() => router.push("/register")}>
          Belum memiliki akun? <span className="font-bold">Daftar</span>
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
