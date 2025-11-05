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
      // If teacher needs approval, show message and redirect to login
      if (data.needsApproval) {
        // The success message will be shown in the UI
        return;
      }
      
      // Redirect based on role after successful registration
      if (data.role === "teacher" || data.role === "admin") {
        router.push("/dashboard/teacher");
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
      <FormControl component="fieldset" error={!!errors.role}>
        <FormLabel component="legend">Register as</FormLabel>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <RadioGroup {...field} row>
              <FormControlLabel
                value="student"
                control={<Radio />}
                label="Student"
              />
              <FormControlLabel
                value="teacher"
                control={<Radio />}
                label="Teacher"
              />
            </RadioGroup>
          )}
        />
        {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
      </FormControl>
      {mutation.isSuccess && mutation.data?.needsApproval && (
        <Alert severity="info">
          Registration successful! Your teacher account is pending approval. You will be notified once an admin approves your registration.
        </Alert>
      )}
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
