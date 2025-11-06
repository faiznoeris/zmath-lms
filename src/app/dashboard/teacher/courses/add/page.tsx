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
        throw new Error(result.error || "Failed to create course");
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
          { label: "Dashboard", href: "/dashboard" },
          { label: "Courses", href: "/dashboard/teacher/courses" },
          { label: "Add" },
        ]}
      />

      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Create Course
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add a new course to the system
        </Typography>
      </Box>

      <Card elevation={2}>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Course Title */}
              <TextField
                label="Course Title"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
                {...register("title", { required: "Title is required" })}
              />

              {/* Description */}
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                placeholder="Provide a brief description of the course..."
                {...register("description")}
              />

              {/* Error Message */}
              {mutation.isError && (
                <Alert severity="error">
                  {mutation.error instanceof Error ? mutation.error.message : "Creation failed"}
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
                  {mutation.isPending ? "Creating..." : "Create Course"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push("/dashboard/teacher/courses")}
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
