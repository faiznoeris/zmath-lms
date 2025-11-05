"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Breadcrumbs,
  Link,
  Skeleton,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import QuizIcon from "@mui/icons-material/Quiz";
import { fetchCourseById } from "@/src/services/course.service";
import { fetchLessonsByCourse } from "@/src/services/lesson.service";
import { fetchQuizzesByCourse } from "@/src/services/quiz.service";
import { Lesson } from "@/src/models/Lesson";
import { Quiz } from "@/src/models/Quiz";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  // Fetch course
  const { data: course, isLoading: courseLoading, error: courseError } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const result = await fetchCourseById(courseId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!courseId,
  });

  // Fetch lessons
  const { data: lessons = [], isLoading: lessonsLoading, error: lessonsError } = useQuery<Lesson[]>({
    queryKey: ["course-lessons", courseId],
    queryFn: async () => {
      const result = await fetchLessonsByCourse(courseId);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!courseId,
  });

  // Fetch quizzes
  const { data: quizzes = [], isLoading: quizzesLoading } = useQuery<Quiz[]>({
    queryKey: ["course-quizzes", courseId],
    queryFn: async () => {
      const result = await fetchQuizzesByCourse(courseId);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!courseId,
  });

  const isLoading = courseLoading || lessonsLoading || quizzesLoading;
  const error = courseError || lessonsError;

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Alert severity="error">
          Error loading course: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          color="inherit"
          onClick={() => router.push("/dashboard/student")}
          sx={{ cursor: "pointer" }}
        >
          My Courses
        </Link>
        <Typography color="text.primary">
          {course?.title || "Course Details"}
        </Typography>
      </Breadcrumbs>

      {/* Course Header */}
      {isLoading ? (
        <Skeleton variant="rectangular" height={150} sx={{ mb: 4 }} />
      ) : (
        <Card elevation={2} sx={{ mb: 4, p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <SchoolIcon sx={{ fontSize: 40, color: "primary.main" }} />
            <Typography variant="h4" component="h1" fontWeight={600}>
              {course?.title}
            </Typography>
          </Box>
          {course?.description && (
            <Typography variant="body1" color="text.secondary">
              {course.description}
            </Typography>
          )}
        </Card>
      )}

      {/* Lessons Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Lessons
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} variant="rectangular" height={100} />
          ))}
        </Box>
      ) : lessons.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 3,
          }}
        >
          <MenuBookIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Lessons Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This course doesn&apos;t have any lessons yet.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {lessons.map((lesson) => (
            <Card
              key={lesson.id}
              elevation={1}
              sx={{
                transition: "all 0.3s",
                "&:hover": {
                  boxShadow: 3,
                },
              }}
            >
              <CardActionArea
                onClick={() =>
                  router.push(
                    `/dashboard/student/courses/${courseId}/lessons/${lesson.id}`
                  )
                }
                sx={{ p: 2 }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {lesson.title}
                      </Typography>
                      {lesson.content && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {lesson.content}
                        </Typography>
                      )}
                    </Box>
                    <MenuBookIcon sx={{ color: "text.secondary" }} />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Quizzes Section */}
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Quizzes
        </Typography>
        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[1, 2].map((n) => (
              <Skeleton key={n} variant="rectangular" height={80} />
            ))}
          </Box>
        ) : quizzes.length === 0 ? (
          <Alert severity="info">No quizzes available for this course.</Alert>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {quizzes.map((quiz) => (
              <Card
                key={quiz.id}
                elevation={1}
                sx={{
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: 3,
                  },
                }}
              >
                <CardActionArea
                  onClick={() =>
                    router.push(`/dashboard/student/quizzes/detail/${quiz.id}`)
                  }
                  sx={{ p: 2 }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <QuizIcon sx={{ color: "warning.main" }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {quiz.title}
                        </Typography>
                        {quiz.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {quiz.description}
                          </Typography>
                        )}
                      </Box>
                      <Chip label="Quiz" color="warning" size="small" />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
