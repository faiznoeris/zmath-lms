import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Alert, TextField, Button } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import { registerSchema } from "@/src/schemas";
import PasswordField from "../../components/PasswordField/PasswordField.component";
import { registerApi } from "../actions";

import styles from "./RegisterForm.module.css";

export interface RegisterFormInputs {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: yupResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: () => {
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
        error={!!errors.fullName}
        label="Full Name"
        helperText={errors.fullName?.message}
        {...register("fullName")}
      />
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
      <PasswordField
        error={!!errors.confirmPassword}
        label="Confirm Password"
        helperText={errors.confirmPassword?.message}
        {...register("confirmPassword")}
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
