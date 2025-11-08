import * as yup from "yup";
import YupPassword from "yup-password";

YupPassword(yup);

export const registerSchema = yup.object().shape({
  fullName: yup.string().required("Nama Lengkap wajib diisi"),
  email: yup
    .string()
    .email("Email harus valid")
    .required("Email wajib diisi"),
  password: yup
    .string()
    .min(6, "Kata sandi minimal 6 karakter")
    .minUppercase(1, "Kata sandi harus mengandung minimal 1 huruf kapital")
    .minNumbers(1, "Kata sandi harus mengandung minimal 1 angka")
    .required("Kata sandi wajib diisi"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Kata sandi tidak cocok")
    .required("Konfirmasi kata sandi Anda"),
  role: yup
    .string()
    .oneOf(["student", "teacher"], "Silakan pilih peran yang valid")
    .required("Peran wajib diisi"),
});

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Email harus valid")
    .required("Email wajib diisi"),
  password: yup
    .string()
    .min(6, "Kata sandi minimal 6 karakter")
    .minUppercase(1, "Kata sandi harus mengandung minimal 1 huruf kapital")
    .minNumbers(1, "Kata sandi harus mengandung minimal 1 angka")
    .required("Kata sandi wajib diisi"),
});
