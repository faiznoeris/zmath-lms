"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../../utils/supabase/client";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { CreateCourseInput } from "../../../../../models/Course";

// Create course
const createCourseApi = async (data: CreateCourseInput) => {
  const supabase = createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase.from("courses").insert([
    {
      title: data.title,
      description: data.description,
      teacher_id: data.teacher_id || null,
      user_id: user.id,
    },
  ]);

  if (error) throw new Error(error.message);
};

export default function AddCoursePage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCourseInput>();

  const mutation = useMutation({
    mutationFn: createCourseApi,
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
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
        aria-label="breadcrumb"
      >
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard/teacher"
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          Dashboard
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard/teacher/courses"
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          Courses
        </Link>
        <Typography color="text.primary" sx={{ display: "flex", alignItems: "center" }}>
          Add
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Create Course
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add a new course to the system
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => router.push("/dashboard/teacher/courses")}
          sx={{ mt: 2 }}
        >
          View All Courses
        </Button>
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

              {/* Teacher ID (optional) */}
              <TextField
                label="Teacher ID (Optional)"
                fullWidth
                placeholder="Assign a teacher to this course"
                helperText="Leave empty if not assigning a specific teacher"
                {...register("teacher_id")}
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
