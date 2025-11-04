"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { CreateLessonInput } from "../../../../../models/Lesson";
import { Course } from "../../../../../models/Course";

// Fetch all courses
const fetchCoursesApi = async (): Promise<Course[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("title", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

// Create lesson
const createLessonApi = async (data: CreateLessonInput) => {
  const supabase = createClient();

  const { error } = await supabase.from("lessons").insert([
    {
      title: data.title,
      content: data.content,
      order_number: data.order_number,
      course_id: data.course_id,
    },
  ]);

  if (error) throw new Error(error.message);
};

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
    queryFn: fetchCoursesApi,
  });

  const mutation = useMutation({
    mutationFn: createLessonApi,
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
          href="/dashboard/teacher/lessons"
          sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          Lessons
        </Link>
        <Typography color="text.primary" sx={{ display: "flex", alignItems: "center" }}>
          Add
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Create Lesson
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add a new lesson to a course
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => router.push("/dashboard/teacher/lessons")}
          sx={{ mt: 2 }}
        >
          View All Lessons
        </Button>
      </Box>

      <Card elevation={2}>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Lesson Title */}
              <TextField
                label="Lesson Title"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
                {...register("title", { required: "Title is required" })}
              />

              {/* Course Selection */}
              <FormControl fullWidth error={!!errors.course_id}>
                <InputLabel>Course *</InputLabel>
                <Select
                  label="Course *"
                  defaultValue=""
                  {...register("course_id", { 
                    required: "Course is required",
                    setValueAs: (value) => Number(value) 
                  })}
                >
                  <MenuItem value="">
                    <em>Select a course</em>
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
                  <FormHelperText>Select the course this lesson belongs to</FormHelperText>
                )}
              </FormControl>

              {/* Order Number */}
              <TextField
                label="Order Number"
                fullWidth
                type="number"
                error={!!errors.order_number}
                helperText={errors.order_number?.message || "Determines the lesson sequence"}
                {...register("order_number", { 
                  required: "Order number is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Order must be at least 1" }
                })}
              />

              {/* Content */}
              <TextField
                label="Content"
                fullWidth
                multiline
                rows={8}
                placeholder="Enter the lesson content..."
                {...register("content")}
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
                  {mutation.isPending ? "Creating..." : "Create Lesson"}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push("/dashboard/teacher/lessons")}
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
