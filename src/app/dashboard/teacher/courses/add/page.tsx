"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Breadcrumbs } from "@/src/components";
import SaveIcon from "@mui/icons-material/Save";
import { CreateCourseInput } from "../../../../../models/Course";
import { createCourse } from "@/src/services/course.service";

export default function AddCoursePage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCourseInput>();

  const mutation = useMutation({
    mutationFn: async (data: CreateCourseInput) => {
      const result = await createCourse({
        title: data.title,
        description: data.description,
        teacher_id: data.teacher_id,
        user_id: "", // Will be set by server action
      });
      if (!result.success) {
        throw new Error(result.error || "Gagal membuat kursus");
      }
    },
    onSuccess: () => {
      router.push("/dashboard/teacher/courses");
    },
  });

  const onSubmit = (data: CreateCourseInput) => {
    mutation.mutate(data);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          
          { label: "Kursus", href: "/dashboard/teacher/courses" },
          { label: "Tambah" },
        ]}
      />

      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Buat Kursus
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tambahkan kursus baru ke sistem
        </Typography>
      </Box>

      <Card elevation={2}>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Course Title */}
              <TextField
                label="Judul Kursus"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
                {...register("title", { required: "Judul wajib diisi" })}
              />

              {/* Description */}
              <TextField
                label="Deskripsi"
                fullWidth
                multiline
                rows={4}
                placeholder="Berikan deskripsi singkat tentang kursus..."
                {...register("description")}
              />

              {/* Error Message */}
              {mutation.isError && (
                <Alert severity="error">
                  {mutation.error instanceof Error ? mutation.error.message : "Gagal membuat"}
                </Alert>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={mutation.isPending}
                  startIcon={mutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
                  fullWidth
                >
                  {mutation.isPending ? "Membuat..." : "Buat Kursus"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push("/dashboard/teacher/courses")}
                  disabled={mutation.isPending}
                >
                  Batal
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
