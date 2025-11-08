"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchCourses } from "@/src/services/course.service";
import { createLesson } from "@/src/services/lesson.service";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { Breadcrumbs } from "@/src/components";
import SaveIcon from "@mui/icons-material/Save";
import { CreateLessonInput } from "../../../../../models/Lesson";

export default function AddLessonPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLessonInput>();

  // Fetch courses
  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const result = await fetchCourses();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateLessonInput) => {
      const result = await createLesson(data);
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      router.push("/dashboard/teacher/lessons");
    },
  });

  const onSubmit = (data: CreateLessonInput) => {
    mutation.mutate(data);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          
          { label: "Pelajaran", href: "/dashboard/teacher/lessons" },
          { label: "Tambah" },
        ]}
      />

      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Buat Pelajaran
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tambahkan pelajaran baru ke kursus
        </Typography>
      </Box>

      <Card elevation={2}>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Lesson Title */}
              <TextField
                label="Judul Pelajaran"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
                {...register("title", { required: "Judul wajib diisi" })}
              />

              {/* Course Selection */}
              <FormControl fullWidth error={!!errors.course_id}>
                <InputLabel>Kursus *</InputLabel>
                <Select
                  label="Kursus *"
                  defaultValue=""
                  {...register("course_id", { 
                    required: "Kursus wajib diisi"
                  })}
                >
                  <MenuItem value="">
                    <em>Pilih kursus</em>
                  </MenuItem>
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.title}
                    </MenuItem>
                  ))}
                </Select>
                {errors.course_id && (
                  <FormHelperText error>{errors.course_id.message}</FormHelperText>
                )}
                {!errors.course_id && (
                  <FormHelperText>Pilih kursus untuk pelajaran ini</FormHelperText>
                )}
              </FormControl>

              {/* Content */}
              <TextField
                label="Konten"
                fullWidth
                multiline
                rows={8}
                placeholder="Masukkan konten pelajaran..."
                {...register("content")}
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
                  {mutation.isPending ? "Membuat..." : "Buat Pelajaran"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push("/dashboard/teacher/lessons")}
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
