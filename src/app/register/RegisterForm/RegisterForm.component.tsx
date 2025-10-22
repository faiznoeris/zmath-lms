import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Alert, TextField, Button } from "@mui/material";

import PasswordField from "../../components/PasswordField/PasswordField.component";
import { registerApi } from "../actions";

import styles from "./RegisterForm.module.css";

export interface RegisterFormInputs {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: () => {
      // TODO: handle successful registration (e.g., redirect to login)
      router.push("/");
    },
  });

  const onSubmit = (data: RegisterFormInputs) => {
    mutation.reset();
    mutation.mutate(data);
  };

  return (
    <form className={styles.registerForm} onSubmit={handleSubmit(onSubmit)}>
      <h2 className={styles.title}>Register</h2>
      <TextField
        error={!!errors.username}
        label="Username"
        helperText={errors.username?.message}
        {...register("username", { required: "Username is required" })}
      />
      <TextField
        error={!!errors.email}
        label="Email"
        helperText={errors.email?.message}
        {...register("email", { required: "Email is required" })}
      />
      <PasswordField
        error={!!errors.password}
        label="Password"
        helperText={errors.password?.message}
        {...register("password", {
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
        })}
      />
      <PasswordField
        error={!!errors.confirmPassword}
        label="Confirm Password"
        helperText={errors.confirmPassword?.message}
        {...register("confirmPassword", {
          required: "Please confirm your password",
          validate: (val: string) => {
            if (watch("password") != val) {
              return "Your password does not match";
            }
          },
        })}
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
          Register
        </Button>
        <Button onClick={() => router.push("/login")}>Back to Login</Button>
      </div>
    </form>
  );
};

export default RegisterForm;
