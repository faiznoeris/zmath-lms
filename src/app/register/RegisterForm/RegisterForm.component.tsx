import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Alert, TextField, Button, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, FormHelperText } from "@mui/material";
import { yupResolver } from "@hookform/resolvers/yup";

import { registerSchema } from "@/src/schemas";
import PasswordField from "../../../components/PasswordField/PasswordField.component";
import { registerApi } from "../actions";

import styles from "./RegisterForm.module.css";

export interface RegisterFormInputs {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "student" | "teacher";
}

const RegisterForm = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      role: "student",
    },
  });

  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      // If teacher needs approval, redirect to login with message
      if (data.needsApproval) {
        router.push("/login?message=pending_approval");
        return;
      }
      
      // Redirect based on role after successful registration
      if (data.role === "student") {
        router.push("/dashboard/student");
      } else if (data.role === "teacher") {
        router.push("/dashboard/teacher");
      } else if (data.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard");
      }
    },
  });

  const onSubmit = (data: RegisterFormInputs) => {
    mutation.reset();
    mutation.mutate(data);
  };

  return (
    <form className={styles.registerForm} onSubmit={handleSubmit(onSubmit)}>
      <h2 className={styles.title}>Daftar</h2>
      <TextField
        error={!!errors.fullName}
        label="Nama Lengkap"
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
        label="Kata Sandi"
        helperText={errors.password?.message}
        {...register("password")}
      />
      <PasswordField
        error={!!errors.confirmPassword}
        label="Konfirmasi Kata Sandi"
        helperText={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <FormControl component="fieldset" error={!!errors.role}>
        <FormLabel component="legend">Daftar sebagai</FormLabel>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <RadioGroup {...field} row>
              <FormControlLabel
                value="student"
                control={<Radio />}
                label="Siswa"
              />
              <FormControlLabel
                value="teacher"
                control={<Radio />}
                label="Guru"
              />
            </RadioGroup>
          )}
        />
        {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
      </FormControl>
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
          Daftar
        </Button>
        <Button onClick={() => router.push("/login")}>Kembali ke Masuk</Button>
      </div>
    </form>
  );
};

export default RegisterForm;
