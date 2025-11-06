"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { Breadcrumbs } from "@/src/components";
import SaveIcon from "@mui/icons-material/Save";
import { UpdateCourseInput } from "../../../../../../models/Course";
import { fetchCourseById, updateCourse } from "@/src/services/course.service";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateCourseInput>();

  // Fetch course data
  const { data: course, isLoading, error } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const result = await fetchCourseById(courseId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch course");
      }
      return result.data;
    },
    enabled: !!courseId,
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (course) {
      setValue("title", course.title);
      setValue("description", course.description || "");
    }
  }, [course, setValue]);

  // Update mutation
  const mutation = useMutation({
    mutationFn: async (data: UpdateCourseInput) => {
      const result = await updateCourse(courseId, data);
      if (!result.success) {
        throw new Error(result.error || "Failed to update course");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      router.push("/dashboard/teacher/courses");
    },
  });

  const onSubmit = (data: UpdateCourseInput) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Alert severity="error">
          Error loading course: {error instanceof Error ? error.message : "Unknown error"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Courses", href: "/dashboard/teacher/courses" },
          { label: "Edit" },
        ]}
      />

      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Edit Course
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update course information
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
                  {mutation.error instanceof Error ? mutation.error.message : "Update failed"}
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
                  {mutation.isPending ? "Updating..." : "Update Course"}
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
