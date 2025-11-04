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
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DescriptionIcon from "@mui/icons-material/Description";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import ImageIcon from "@mui/icons-material/Image";
import { createClient } from "@/src/utils/supabase/client";
import { Lesson } from "@/src/models/Lesson";
import { Material } from "@/src/models/Material";

const supabase = createClient();

// Fetch lesson details
const fetchLessonApi = async (id: number): Promise<Lesson> => {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

// Fetch materials for a lesson
const fetchLessonMaterialsApi = async (lessonId: string): Promise<Material[]> => {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data || [];
};

// Helper function to get material icon
const getMaterialIcon = (type: string) => {
  switch (type) {
    case "video":
      return <VideoLibraryIcon sx={{ color: "error.main" }} />;
    case "document":
      return <DescriptionIcon sx={{ color: "primary.main" }} />;
    case "image":
      return <ImageIcon sx={{ color: "success.main" }} />;
    default:
      return <DescriptionIcon sx={{ color: "text.secondary" }} />;
  }
};

// Helper function to get material type label
const getMaterialTypeLabel = (type: string) => {
  switch (type) {
    case "video":
      return "Video";
    case "document":
      return "Document";
    case "image":
      return "Image";
    case "interactive":
      return "Interactive";
    default:
      return "Material";
  }
};

export default function LessonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = parseInt(params.lessonId as string);
  const courseId = parseInt(params.id as string);

  // Fetch lesson
  const { data: lesson, isLoading: lessonLoading, error: lessonError } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: () => fetchLessonApi(lessonId),
    enabled: !!lessonId,
  });

  // Fetch materials
  const { data: materials = [], isLoading: materialsLoading } = useQuery<Material[]>({
    queryKey: ["lesson-materials", lessonId],
    queryFn: () => fetchLessonMaterialsApi(lessonId.toString()),
    enabled: !!lessonId,
  });

  const isLoading = lessonLoading || materialsLoading;

  if (lessonError) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Alert severity="error">
          Error loading lesson: {lessonError.message}
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
        <Link
          underline="hover"
          color="inherit"
          onClick={() => router.push(`/dashboard/student/courses/${courseId}`)}
          sx={{ cursor: "pointer" }}
        >
          Course Details
        </Link>
        <Typography color="text.primary">
          {lesson?.title || "Lesson"}
        </Typography>
      </Breadcrumbs>

      {/* Lesson Header */}
      {isLoading ? (
        <Skeleton variant="rectangular" height={150} sx={{ mb: 4 }} />
      ) : (
        <Card elevation={2} sx={{ mb: 4, p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Chip
              label={`Lesson #${lesson?.order_number}`}
              color="primary"
              size="small"
            />
            <MenuBookIcon sx={{ fontSize: 32, color: "primary.main" }} />
            <Typography variant="h4" component="h1" fontWeight={600}>
              {lesson?.title}
            </Typography>
          </Box>
          {lesson?.content && (
            <Typography variant="body1" color="text.secondary">
              {lesson.content}
            </Typography>
          )}
        </Card>
      )}

      {/* Materials Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Materials
        </Typography>
        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[1, 2].map((n) => (
              <Skeleton key={n} variant="rectangular" height={80} />
            ))}
          </Box>
        ) : materials.length === 0 ? (
          <Alert severity="info">No materials available for this lesson.</Alert>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {materials.map((material) => (
              <Card
                key={material.id}
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
                      `/dashboard/student/courses/${courseId}/lessons/${lessonId}/materials/${material.id}`
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
                      {getMaterialIcon(material.type)}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {material.title}
                        </Typography>
                        {material.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {material.description}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={getMaterialTypeLabel(material.type)}
                        size="small"
                        variant="outlined"
                      />
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
