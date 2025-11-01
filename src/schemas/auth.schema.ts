import * as yup from "yup";
import YupPassword from "yup-password";

YupPassword(yup);

export const registerSchema = yup.object().shape({
  fullName: yup.string().required("Full Name is required"),
  email: yup
    .string()
    .email("Email must be valid")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .minUppercase(1, "Password must contain at least 1 uppercase letter")
    .minNumbers(1, "Password must contain at least 1 number")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm your password"),
});

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Email must be valid")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .minUppercase(1, "Password must contain at least 1 uppercase letter")
    .minNumbers(1, "Password must contain at least 1 number")
    .required("Password is required"),
});
